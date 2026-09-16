/**
 * ============================================================
 * MOISESMUSIC — Cliente Supabase (Plan Gratuito)
 * Gestión de datos en tiempo real y fallback local sin dependencias pesadas.
 * ============================================================
 */

(function (window) {
  // Claves para almacenamiento local de configuración en el navegador
  var STORAGE_URL_KEY = 'mm_supabase_url';
  var STORAGE_ANON_KEY = 'mm_supabase_anon_key';

  // ─── Credenciales del proyecto Supabase ───────────────────────────────────
  // El anon key es seguro de exponer (solo permite operaciones permitidas por RLS).
  var SUPABASE_PROJECT_URL = 'https://ewjcksbboehhixbwifbv.supabase.co';
  var SUPABASE_ANON_PUBLIC  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amNrc2Jib2VoaGl4YndpZmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTQzMDAsImV4cCI6MjEwNDczMDMwMH0.YlBe_ryk1HfU4qtFeM7xTgIr38flr-R655Oi8bMBU7g';
  // ──────────────────────────────────────────────────────────────────────────

  // Configuración por defecto — las claves del proyecto tienen prioridad máxima
  var defaultConfig = {
    url: SUPABASE_PROJECT_URL || window.SUPABASE_URL || localStorage.getItem(STORAGE_URL_KEY) || '',
    anonKey: SUPABASE_ANON_PUBLIC || window.SUPABASE_ANON_KEY || localStorage.getItem(STORAGE_ANON_KEY) || ''
  };

  var client = null;

  function initClient() {
    if (defaultConfig.url && defaultConfig.anonKey && window.supabase) {
      try {
        client = window.supabase.createClient(defaultConfig.url, defaultConfig.anonKey);
      } catch (err) {
        console.warn('[Supabase] Error al inicializar cliente:', err);
        client = null;
      }
    }
    return client;
  }

  // Intentar inicializar si la librería ya está cargada
  if (window.supabase) {
    initClient();
  }

  var MM_DB = {
    // Verificación y configuración
    isConfigured: function () {
      return !!(defaultConfig.url && defaultConfig.anonKey);
    },

    getConfig: function () {
      return {
        url: defaultConfig.url,
        anonKey: defaultConfig.anonKey
      };
    },

    saveConfig: function (url, anonKey) {
      defaultConfig.url = (url || '').trim();
      defaultConfig.anonKey = (anonKey || '').trim();
      localStorage.setItem(STORAGE_URL_KEY, defaultConfig.url);
      localStorage.setItem(STORAGE_ANON_KEY, defaultConfig.anonKey);
      return initClient();
    },

    clearConfig: function () {
      defaultConfig.url = '';
      defaultConfig.anonKey = '';
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_ANON_KEY);
      client = null;
    },

    getClient: function () {
      if (!client) {
        initClient();
      }
      return client;
    },

    // ----------------------------------------------------
    // AUTENTICACIÓN (Para el administrador)
    // ----------------------------------------------------
    auth: {
      login: async function (email, password) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Supabase no está configurado. Ingresa la URL y Anon Key primero.');
        var res = await c.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        return res.data;
      },

      logout: async function () {
        var c = MM_DB.getClient();
        if (c) await c.auth.signOut();
      },

      getUser: async function () {
        var c = MM_DB.getClient();
        if (!c) return null;
        var res = await c.auth.getUser();
        if (res.error || !res.data) return null;
        return res.data.user;
      },

      onAuthStateChange: function (callback) {
        var c = MM_DB.getClient();
        if (!c) return { unsubscribe: function () {} };
        var subscription = c.auth.onAuthStateChange(function (event, session) {
          callback(event, session ? session.user : null);
        });
        return subscription.data.subscription;
      }
    },

    // ----------------------------------------------------
    // CONTENIDOS DEL SITIO (Títulos, Textos y Enlaces)
    // ----------------------------------------------------
    content: {
      getAll: async function () {
        var c = MM_DB.getClient();
        if (!c) return null;
        var res = await c.from('site_content').select('key, value');
        if (res.error) {
          console.warn('[Supabase] Error cargando contenidos:', res.error);
          return null;
        }
        var map = {};
        (res.data || []).forEach(function (item) {
          map[item.key] = item.value;
        });
        return map;
      },

      save: async function (key, value, description) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var payload = {
          key: key,
          value: value,
          updated_at: new Date().toISOString()
        };
        if (description) payload.description = description;
        var res = await c.from('site_content').upsert(payload);
        if (res.error) throw res.error;
        return res.data;
      },

      bulkSave: async function (itemsMap) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var updates = Object.keys(itemsMap).map(function (k) {
          return {
            key: k,
            value: itemsMap[k],
            updated_at: new Date().toISOString()
          };
        });
        var res = await c.from('site_content').upsert(updates);
        if (res.error) throw res.error;
        return res.data;
      }
    },

    // ----------------------------------------------------
    // EVENTOS / TOUR
    // ----------------------------------------------------
    events: {
      getAll: async function () {
        var c = MM_DB.getClient();
        if (!c) return null;
        var res = await c.from('events').select('*').order('display_order', { ascending: true });
        if (res.error) {
          console.warn('[Supabase] Error cargando eventos:', res.error);
          return null;
        }
        return res.data;
      },

      save: async function (eventData) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('events').upsert(eventData).select();
        if (res.error) throw res.error;
        return res.data ? res.data[0] : null;
      },

      delete: async function (id) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('events').delete().eq('id', id);
        if (res.error) throw res.error;
        return true;
      }
    },

    // ----------------------------------------------------
    // MÚSICA / DISCOGRAFÍA
    // ----------------------------------------------------
    music: {
      getAll: async function () {
        var c = MM_DB.getClient();
        if (!c) return null;
        var res = await c.from('music').select('*').order('display_order', { ascending: true });
        if (res.error) {
          console.warn('[Supabase] Error cargando discografía:', res.error);
          return null;
        }
        return res.data;
      },

      save: async function (musicData) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('music').upsert(musicData).select();
        if (res.error) throw res.error;
        return res.data ? res.data[0] : null;
      },

      delete: async function (id) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('music').delete().eq('id', id);
        if (res.error) throw res.error;
        return true;
      }
    },

    // ----------------------------------------------------
    // GALERÍA
    // ----------------------------------------------------
    gallery: {
      getAll: async function () {
        var c = MM_DB.getClient();
        if (!c) return null;
        var res = await c.from('gallery').select('*').order('display_order', { ascending: true });
        if (res.error) {
          console.warn('[Supabase] Error cargando galería:', res.error);
          return null;
        }
        return res.data;
      },

      save: async function (galleryData) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('gallery').upsert(galleryData).select();
        if (res.error) throw res.error;
        return res.data ? res.data[0] : null;
      },

      delete: async function (id) {
        var c = MM_DB.getClient();
        if (!c) throw new Error('Cliente Supabase no configurado');
        var res = await c.from('gallery').delete().eq('id', id);
        if (res.error) throw res.error;
        return true;
      }
    },

    // ----------------------------------------------------
    // UTILIDADES PARA FECHAS Y PRÓXIMO EVENTO DEL TOUR
    // ----------------------------------------------------
    parseEventDate: function (ev) {
      if (!ev) return null;
      if (ev.event_date) {
        var d = new Date(ev.event_date + (ev.event_date.includes('T') ? '' : 'T20:00:00'));
        if (!isNaN(d.getTime())) return d;
      }
      var day = parseInt(ev.day_str, 10) || 1;
      var my = (ev.month_year_str || '').trim().toUpperCase();
      var yearMatch = my.match(/\b(20\d\d)\b/);
      var year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
      
      var months = {
        'ENE': 0, 'ENERO': 0, 'JAN': 0,
        'FEB': 1, 'FEBRERO': 1,
        'MAR': 2, 'MARZO': 2,
        'ABR': 3, 'ABRIL': 3, 'APR': 3,
        'MAY': 4, 'MAYO': 4,
        'JUN': 5, 'JUNIO': 5,
        'JUL': 6, 'JULIO': 6,
        'AGO': 7, 'AGOSTO': 7, 'AUG': 7,
        'SEP': 8, 'SEPTIEMBRE': 8, 'SET': 8, 'SETIEMBRE': 8, 'SEPT': 8,
        'OCT': 9, 'OCTUBRE': 9,
        'NOV': 10, 'NOVIEMBRE': 10,
        'DIC': 11, 'DICIEMBRE': 11, 'DEC': 11
      };
      
      var month = 0;
      for (var mKey in months) {
        if (new RegExp('\\b' + mKey + '\\b', 'i').test(my)) {
          month = months[mKey];
          break;
        }
      }
      return new Date(year, month, day, 20, 0, 0);
    },

    getUpcomingEvent: function (eventsList) {
      if (!eventsList || eventsList.length === 0) return null;
      var now = new Date().getTime();
      var parsed = eventsList.map(function (ev) {
        return {
          event: ev,
          date: MM_DB.parseEventDate(ev)
        };
      });

      // Ordenar cronológicamente ascendente
      parsed.sort(function (a, b) {
        return (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0);
      });

      // Primer evento que no haya pasado (con ventana de 24h para el día en curso)
      var upcoming = parsed.find(function (item) {
        return item.date && item.date.getTime() >= (now - 24 * 60 * 60 * 1000);
      });

      return upcoming || parsed[0] || null;
    },

    // ----------------------------------------------------
    // APLICACIÓN MODULAR AL DOM (Sincrónico y Reactivo)
    // ----------------------------------------------------
    applyContent: function (content) {
      if (!content) return;
      if (content.topbar_text) {
        var el = document.getElementById('top');
        if (el) el.textContent = content.topbar_text;
      }
      if (content.hero_tag) {
        var el = document.querySelector('.hero-tag');
        if (el) el.textContent = content.hero_tag;
      }
      if (content.hero_title) {
        var el = document.querySelector('.hero h1');
        if (el) el.innerHTML = content.hero_title;
      }
      if (content.hero_subtitle) {
        var el = document.querySelector('.hero-sub');
        if (el) el.textContent = content.hero_subtitle;
      }
      if (content.hero_bg_image) {
        var hs = document.getElementById('heroScene');
        if (hs) hs.style.backgroundImage = 'url("' + content.hero_bg_image + '")';
      }
      if (content.next_event_bg_image) {
        var neb = document.getElementById('nextEventBanner');
        if (neb) neb.style.backgroundImage = 'url("' + content.next_event_bg_image + '")';
      }
      var nextTitleEl = document.getElementById('nextEventTitle');
      if (content.next_event_title && nextTitleEl && !nextTitleEl.hasAttribute('data-synced')) {
        var venue = content.next_event_venue ? ' – ' + content.next_event_venue : '';
        nextTitleEl.textContent = content.next_event_title + venue;
      }
      var nextCountdownEl = document.getElementById('nextEventCountdown');
      if (content.next_event_date && nextCountdownEl && !nextCountdownEl.hasAttribute('data-synced')) {
        nextCountdownEl.setAttribute('data-target', content.next_event_date);
      }
      if (content.bio_title) {
        var el = document.querySelector('#view-bio .section-title');
        if (el) el.innerHTML = content.bio_title;
      }
      if (content.bio_text) {
        var el = document.querySelector('#view-bio .section-desc');
        if (el) el.textContent = content.bio_text;
      }
      if (content.bio_image) {
        var bioImg = document.getElementById('bioImage');
        if (bioImg) bioImg.src = content.bio_image;
      }
      if (content.stat_years) {
        var el = document.querySelector('#view-bio .stat-row .stat:nth-child(1) .num');
        if (el) el.textContent = content.stat_years;
      }
      if (content.stat_concerts) {
        var el = document.querySelector('#view-bio .stat-row .stat:nth-child(2) .num');
        if (el) el.textContent = content.stat_concerts;
      }
      if (content.stat_projects) {
        var el = document.querySelector('#view-bio .stat-row .stat:nth-child(3) .num');
        if (el) el.textContent = content.stat_projects;
      }

      // Trayectoria (Timeline de Bio: 4 Hitos)
      for (var ti = 1; ti <= 4; ti++) {
        var yrVal = content['tl' + ti + '_year'];
        var titVal = content['tl' + ti + '_title'];
        var descVal = content['tl' + ti + '_desc'];
        var tlItem = document.querySelector('.timeline .tl-item:nth-child(' + ti + ')');
        if (tlItem) {
          if (yrVal) {
            var yrEl = tlItem.querySelector('.yr');
            if (yrEl) yrEl.textContent = yrVal;
          }
          if (titVal) {
            var titEl = tlItem.querySelector('h4');
            if (titEl) titEl.textContent = titVal;
          }
          if (descVal) {
            var descEl = tlItem.querySelector('p');
            if (descEl) descEl.textContent = descVal;
          }
        }
      }

      // Blogs
      if (content.blog1_image) {
        var el = document.getElementById('blogImg1');
        if (el) el.src = content.blog1_image;
        if (window.BLOG_POSTS && window.BLOG_POSTS[1]) window.BLOG_POSTS[1].image = content.blog1_image;
      }
      if (content.blog2_image) {
        var el = document.getElementById('blogImg2');
        if (el) el.src = content.blog2_image;
        if (window.BLOG_POSTS && window.BLOG_POSTS[2]) window.BLOG_POSTS[2].image = content.blog2_image;
      }
      if (content.blog3_image) {
        var el = document.getElementById('blogImg3');
        if (el) el.src = content.blog3_image;
        if (window.BLOG_POSTS && window.BLOG_POSTS[3]) window.BLOG_POSTS[3].image = content.blog3_image;
      }
      if (content.blog1_date) {
        var el = document.getElementById('blogDate1');
        if (el) el.textContent = content.blog1_date;
        if (window.BLOG_POSTS && window.BLOG_POSTS[1]) window.BLOG_POSTS[1].date = content.blog1_date;
      }
      if (content.blog2_date) {
        var el = document.getElementById('blogDate2');
        if (el) el.textContent = content.blog2_date;
        if (window.BLOG_POSTS && window.BLOG_POSTS[2]) window.BLOG_POSTS[2].date = content.blog2_date;
      }
      if (content.blog3_date) {
        var el = document.getElementById('blogDate3');
        if (el) el.textContent = content.blog3_date;
        if (window.BLOG_POSTS && window.BLOG_POSTS[3]) window.BLOG_POSTS[3].date = content.blog3_date;
      }
      if (content.blog1_title) {
        var el = document.getElementById('blogTitle1');
        if (el) el.textContent = content.blog1_title;
        if (window.BLOG_POSTS && window.BLOG_POSTS[1]) window.BLOG_POSTS[1].title = content.blog1_title;
      }
      if (content.blog2_title) {
        var el = document.getElementById('blogTitle2');
        if (el) el.textContent = content.blog2_title;
        if (window.BLOG_POSTS && window.BLOG_POSTS[2]) window.BLOG_POSTS[2].title = content.blog2_title;
      }
      if (content.blog3_title) {
        var el = document.getElementById('blogTitle3');
        if (el) el.textContent = content.blog3_title;
        if (window.BLOG_POSTS && window.BLOG_POSTS[3]) window.BLOG_POSTS[3].title = content.blog3_title;
      }
      if (content.blog1_content && window.BLOG_POSTS && window.BLOG_POSTS[1]) {
        window.BLOG_POSTS[1].content = content.blog1_content;
      }
      if (content.blog2_content && window.BLOG_POSTS && window.BLOG_POSTS[2]) {
        window.BLOG_POSTS[2].content = content.blog2_content;
      }
      if (content.blog3_content && window.BLOG_POSTS && window.BLOG_POSTS[3]) {
        window.BLOG_POSTS[3].content = content.blog3_content;
      }

      // Galería (8 fotos)
      for (var gi = 1; gi <= 8; gi++) {
        var gKey = 'gallery_img_' + gi;
        if (content[gKey]) {
          var galImg = document.getElementById('galImg' + gi);
          if (galImg) galImg.src = content[gKey];
        }
      }

      // Donaciones
      if (content.donate_bank1_country) {
        var el = document.getElementById('donateBank1Country');
        if (el) el.textContent = content.donate_bank1_country;
      }
      if (content.donate_bank1_type) {
        var el = document.getElementById('donateBank1Type');
        if (el) el.textContent = content.donate_bank1_type;
      }
      if (content.donate_bank1_name) {
        var el = document.getElementById('donateBank1Name');
        if (el) el.textContent = content.donate_bank1_name;
      }
      if (content.donate_bank1_holder) {
        var el = document.getElementById('donateBank1Holder');
        if (el) el.textContent = content.donate_bank1_holder;
      }
      if (content.donate_bank1_number) {
        var el = document.getElementById('donateBank1Number');
        if (el) el.textContent = content.donate_bank1_number;
      }
      if (content.donate_bank2_country) {
        var el = document.getElementById('donateBank2Country');
        if (el) el.textContent = content.donate_bank2_country;
      }
      if (content.donate_bank2_type) {
        var el = document.getElementById('donateBank2Type');
        if (el) el.textContent = content.donate_bank2_type;
      }
      if (content.donate_bank2_name) {
        var el = document.getElementById('donateBank2Name');
        if (el) el.textContent = content.donate_bank2_name;
      }
      if (content.donate_bank2_holder) {
        var el = document.getElementById('donateBank2Holder');
        if (el) el.textContent = content.donate_bank2_holder;
      }
      if (content.donate_bank2_number) {
        var el = document.getElementById('donateBank2Number');
        if (el) el.textContent = content.donate_bank2_number;
      }
      if (content.donate_note) {
        var el = document.getElementById('donateNote');
        if (el) el.textContent = content.donate_note;
      }

      // Contacto y Redes
      if (content.contact_email) {
        var links = document.querySelectorAll('a[href^="mailto:"]');
        links.forEach(function (a) {
          a.href = 'mailto:' + content.contact_email;
          if (a.textContent.includes('@')) a.textContent = content.contact_email;
        });
      }
      if (content.whatsapp_url) {
        var wa = document.querySelector('a[aria-label="WhatsApp"]');
        if (wa) wa.href = content.whatsapp_url;
      }
      if (content.instagram_url) {
        var ig = document.querySelector('a[aria-label="Instagram"]');
        if (ig) ig.href = content.instagram_url;
      }
      if (content.facebook_url) {
        var fb = document.querySelector('a[aria-label="Facebook"]');
        if (fb) fb.href = content.facebook_url;
      }
      if (content.twitter_url) {
        var tw = document.querySelector('a[aria-label="X (Twitter)"]');
        if (tw) tw.href = content.twitter_url;
      }
      if (content.youtube_url) {
        var yt = document.querySelector('a[aria-label="YouTube"]');
        if (yt) yt.href = content.youtube_url;
      }

      // Video Destacado de YouTube
      if (content.featured_video_url) {
        var vUrl = content.featured_video_url.trim();
        var match = vUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        var videoId = (match && match[1]) ? match[1] : vUrl;
        var wraps = document.querySelectorAll('.video-frame-wrap');
        wraps.forEach(function (wrap) {
          wrap.setAttribute('data-video-id', videoId);
          var vIframe = wrap.querySelector('iframe');
          if (vIframe) vIframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1';
          var facade = wrap.querySelector('.yt-facade');
          if (facade) facade.style.backgroundImage = "url('https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg')";
          var badge = wrap.querySelector('.yt-facade-badge');
          if (badge) badge.href = 'https://youtu.be/' + videoId;

          if (content.featured_video_title) {
            var vTitle = wrap.querySelector('.yt-facade-top-text h4');
            if (vTitle) vTitle.textContent = content.featured_video_title;
          }
          if (content.featured_video_channel) {
            var vArtist = wrap.querySelector('.yt-facade-top-text span');
            if (vArtist) vArtist.textContent = content.featured_video_channel;
          }
        });
      }
    },

    applyEvents: function (eventsList) {
      if (!eventsList || !eventsList.length) return;
      var tourContainer = document.querySelector('.tour-list');
      if (tourContainer) {
        var html = '';
        eventsList.forEach(function (ev) {
          var tagHtml = ev.tag ? ' <span class="tour-tag">' + ev.tag + '</span>' : '';
          var btnClass = ev.button_text === 'BOLETOS' ? 'btn btn-solid' : 'btn';
          html += '<div class="tour-row">' +
            '<div class="tour-date"><div class="d">' + ev.day_str + '</div><div class="m">' + ev.month_year_str + '</div></div>' +
            '<div class="tour-info"><div class="city">' + ev.city + tagHtml + '</div><div class="venue">' + ev.venue + '</div></div>' +
            '<a class="' + btnClass + '" href="' + (ev.ticket_url || '#') + '" target="_blank" rel="noopener">' + ev.button_text + '</a>' +
            '</div>';
        });
        tourContainer.innerHTML = html;
      }

      var upcomingData = MM_DB.getUpcomingEvent(eventsList);
      if (upcomingData && upcomingData.event) {
        var uEv = upcomingData.event;
        var uDate = upcomingData.date;

        var bannerTitleEl = document.getElementById('nextEventTitle');
        if (bannerTitleEl) {
          var formattedTitle = uEv.day_str + ' ' + uEv.month_year_str.toUpperCase() + ', ' + uEv.city.toUpperCase() + (uEv.venue ? ' – ' + uEv.venue.toUpperCase() : '');
          bannerTitleEl.textContent = formattedTitle;
          bannerTitleEl.setAttribute('data-synced', 'true');
        }

        var countdownEl = document.getElementById('nextEventCountdown');
        if (countdownEl && uDate) {
          countdownEl.setAttribute('data-target', uDate.toISOString());
          countdownEl.setAttribute('data-synced', 'true');
          if (window.updateNextEventCountdown) {
            window.updateNextEventCountdown();
          }
        }

        var bannerBtn = document.querySelector('.event-banner .btn-banner');
        if (bannerBtn) {
          if (uEv.ticket_url && uEv.ticket_url !== '#' && uEv.ticket_url.trim() !== '') {
            bannerBtn.href = uEv.ticket_url;
            bannerBtn.textContent = (uEv.button_text || 'BOLETOS') + ' — ' + uEv.city.split(',')[0].trim().toUpperCase();
            bannerBtn.target = '_blank';
            bannerBtn.rel = 'noopener';
          } else {
            bannerBtn.href = '#tour';
            bannerBtn.textContent = 'TODAS LAS FECHAS';
          }
        }
      }
    },

    applyMusic: function (musicList) {
      if (!musicList || !musicList.length) return;
      var musicGrid = document.getElementById('musicGrid');
      if (musicGrid) {
        var mHtml = '';
        musicList.forEach(function (m, index) {
          var fallbackImg = 'img/musica' + ((index % 6) + 1) + '.png';
          var coverSrc = m.cover_url || fallbackImg;
          var isExt = m.stream_url && m.stream_url !== '#' && m.stream_url.trim() !== '';
          var ctaHref = isExt ? m.stream_url : '#musica';
          var ctaTarget = isExt ? 'target="_blank" rel="noopener"' : 'data-nav="musica"';
          mHtml += '<div class="card">' +
            '<div class="card-media"><img src="' + coverSrc + '" alt="' + m.title + '" loading="lazy"></div>' +
            '<div class="card-body">' +
            '<div class="card-kicker">' + m.category + '</div>' +
            '<div class="card-title">' + m.title + '</div>' +
            '<a class="card-cta" href="' + ctaHref + '" ' + ctaTarget + '>ESCUCHAR EN SPOTIFY →</a>' +
            '</div></div>';
        });
        musicGrid.innerHTML = mHtml;
      }

      var homeMusicGrid = document.getElementById('homeMusicGrid') ||
                          document.querySelector('.home-music-section .grid-3') ||
                          document.querySelector('#view-inicio .grid-3');
      if (homeMusicGrid) {
        var top3 = musicList.slice(0, 3);
        var hHtml = '';
        top3.forEach(function (m, index) {
          var fallbackImg = 'img/musica' + ((index % 6) + 1) + '.png';
          var coverSrc = m.cover_url || fallbackImg;
          var isExt = m.stream_url && m.stream_url !== '#' && m.stream_url.trim() !== '';
          var ctaHref = isExt ? m.stream_url : '#musica';
          var ctaTarget = isExt ? 'target="_blank" rel="noopener"' : 'data-nav="musica"';
          hHtml += '<div class="card">' +
            '<div class="card-media"><img src="' + coverSrc + '" alt="' + m.title + '" loading="lazy"></div>' +
            '<div class="card-body">' +
            '<div class="card-kicker">' + m.category + '</div>' +
            '<div class="card-title">' + m.title + '</div>' +
            '<div class="card-meta">Disponible en todas las plataformas</div>' +
            '<a class="card-cta" href="' + ctaHref + '" ' + ctaTarget + '>ESCUCHAR →</a>' +
            '</div></div>';
        });
        homeMusicGrid.innerHTML = hHtml;
      }
    },

    // ----------------------------------------------------
    // HIDRATACIÓN AUTOMÁTICA DEL SITIO PÚBLICO (index.html)
    // ----------------------------------------------------
    hydratePublicSite: async function () {
      // 0. HIDRATACIÓN INMEDIATA SÍNCRONA DESDE CACHÉ LOCAL (0ms - Elimina el parpadeo de 3 segundos)
      try {
        var cachedContent = localStorage.getItem('mm_cached_site_content');
        if (cachedContent) MM_DB.applyContent(JSON.parse(cachedContent));
        var cachedEvents = localStorage.getItem('mm_cached_events');
        if (cachedEvents) MM_DB.applyEvents(JSON.parse(cachedEvents));
        var cachedMusic = localStorage.getItem('mm_cached_music');
        if (cachedMusic) MM_DB.applyMusic(JSON.parse(cachedMusic));
      } catch (e) {}

      if (!MM_DB.isConfigured()) return;

      // 1. OBTENCIÓN EN SEGUNDO PLANO DESDE SUPABASE Y ACTUALIZACIÓN
      try {
        var content = await MM_DB.content.getAll();
        if (content) {
          MM_DB.applyContent(content);
          try { localStorage.setItem('mm_cached_site_content', JSON.stringify(content)); } catch (e) {}
        }

        var eventsList = await MM_DB.events.getAll();
        if (eventsList && eventsList.length > 0) {
          MM_DB.applyEvents(eventsList);
          try { localStorage.setItem('mm_cached_events', JSON.stringify(eventsList)); } catch (e) {}
        }

        var musicList = await MM_DB.music.getAll();
        if (musicList && musicList.length > 0) {
          MM_DB.applyMusic(musicList);
          try { localStorage.setItem('mm_cached_music', JSON.stringify(musicList)); } catch (e) {}
        }
      } catch (e) {
        console.warn('[Supabase] Error en hidratación dinámica:', e);
      }
    }
  };

  window.MM_DB = MM_DB;
})(window);
