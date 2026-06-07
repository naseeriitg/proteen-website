document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. STATE & GLOBAL CONFIG
  // ==========================================
  let cart = [];
  let visitorGeo = null;
  let visitorLeads = [];
  let pageViews = 0;
  
  // Simulated Location list for rotating footer ticker
  const mockLocations = [
    'Srinagar, Jammu & Kashmir', 'Gurez Valley, Kashmir', 'New Delhi, Delhi', 
    'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Sopore, Kashmir',
    'Pune, Maharashtra', 'Hyderabad, Telangana', 'Anantnag, Kashmir'
  ];

  // Geolocation API fetch
  const detectLocation = async () => {
    const geoStatus = document.getElementById('geo-info-status');
    const regionInput = document.getElementById('lead-region');
    
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        visitorGeo = {
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          country: data.country_name || 'India',
          ip: data.ip || '0.0.0.0',
          isp: data.org || 'Local Network'
        };
        
        // Prefill form
        if (geoStatus) {
          geoStatus.textContent = `📍 Autodetected: ${visitorGeo.city}, ${visitorGeo.region}`;
        }
        if (regionInput && !regionInput.value) {
          regionInput.value = `${visitorGeo.city}, ${visitorGeo.region}`;
        }
      } else {
        throw new Error('Geo API failed');
      }
    } catch (err) {
      if (geoStatus) {
        geoStatus.textContent = '📍 Enter location details manually';
      }
    }
    logTraffic();
  };

  // LocalStorage state management
  const loadState = () => {
    // Cart
    const savedCart = localStorage.getItem('proteen_cart');
    if (savedCart) {
      try { cart = JSON.parse(savedCart); } catch (e) { cart = []; }
    }
    
    // Page Views (base 1420 to simulate pre-existing traffic)
    const savedViews = localStorage.getItem('proteen_pageviews');
    pageViews = savedViews ? parseInt(savedViews, 10) + 1 : 1420;
    localStorage.setItem('proteen_pageviews', pageViews);

    // Leads
    const savedLeads = localStorage.getItem('proteen_leads');
    if (savedLeads) {
      try { visitorLeads = JSON.parse(savedLeads); } catch (e) { visitorLeads = []; }
    }

    updateCartUI();
    updateAnalyticsUI();
    startVisitorTicker();
  };

  const saveCart = () => {
    localStorage.setItem('proteen_cart', JSON.stringify(cart));
    updateCartUI();
    updateAnalyticsUI();
  };

  const logTraffic = () => {
    updateAnalyticsUI();
  };

  // Revised Formulations - Top 4 Ingredients Display Data
  const formulas = {
    original: {
      image: './assets/flatlay_green.jpg',
      ingredients: [
        { pct: '61.2%', name: 'Kashmir Kagzi Walnut', sub: 'Hero fat & protein source, wild-harvested in Gurez Valley (52g)', bg: '#3d5238', text: '#ffffff' },
        { pct: '14.1%', name: 'Organic Jaggery', sub: 'Boiled sugarcane juice retaining natural iron and calcium (12g)', bg: '#b87840', text: '#ffffff' },
        { pct: '11.8%', name: 'Puffed Foxtail Millet', sub: 'Ancient grain puff providing protein boost & light texture (10g)', bg: '#ede9df', text: '#1a1814' },
        { pct: '5.9%', name: 'Ground Chia Seeds', sub: 'Amplifying Omega-3 ALA content and fiber binding (5g)', bg: '#8a6820', text: '#ffffff' }
      ]
    },
    cocoa: {
      image: './assets/flatlay_brown.jpg',
      ingredients: [
        { pct: '44.4%', name: 'Kashmir Kagzi Walnut', sub: 'Anchor whole-food ingredient supplying lipids and proteins (20g)', bg: '#8a6820', text: '#ffffff' },
        { pct: '17.8%', name: 'Dark Cocoa (22% fat)', sub: 'Night Mode character antioxidant boost (8g)', bg: '#3e2723', text: '#ffffff' },
        { pct: '13.3%', name: 'Foxtail Millet Flour', sub: 'Crunchy ancient grain fine flour (6g)', bg: '#ede9df', text: '#1a1814' },
        { pct: '10.0%', name: 'Organic Jaggery', sub: 'Natural sweet binder (4.5g)', bg: '#b87840', text: '#ffffff' }
      ]
    },
    brewd: {
      image: './assets/brewd_paste.jpg',
      ingredients: [
        { pct: '47%', name: 'Kashmir Walnut', sub: 'Cold-ground walnut base full of healthy fats (14g)', bg: '#8a6820', text: '#ffffff' },
        { pct: '25%', name: 'Wild Honey & Dates', sub: 'Low glycemic, natural binders and sweeteners (7.5g)', bg: '#b87840', text: '#ffffff' },
        { pct: '12%', name: 'Dark Cocoa', sub: 'Rich antioxidant chocolate base notes (3.6g)', bg: '#3e2723', text: '#ffffff' },
        { pct: '16%', name: 'Chia & Spices', sub: 'Cardamom, saffron, flaxseeds and chia (4.9g)', bg: '#ede9df', text: '#1a1814' }
      ]
    },
    stroopwafel: {
      image: './assets/stroopwafel.jpg',
      ingredients: [
        { pct: '40%', name: 'Kashmir Walnut Fills', sub: 'Organic crushed walnuts baked directly inside the matrix', bg: '#8a6820', text: '#ffffff' },
        { pct: '30%', name: 'Pure Dark Cocoa', sub: 'Gooey cocoa cream sweetened with raw jaggery', bg: '#3e2723', text: '#ffffff' },
        { pct: '20%', name: 'Organic Jaggery', sub: 'Traditional sweet binding syrup', bg: '#b87840', text: '#ffffff' },
        { pct: '10%', name: 'Wheat/Millet Flour', sub: 'High-fiber baking grain structure', bg: '#ede9df', text: '#1a1814' }
      ]
    }
  };

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  const header = document.querySelector('.main-header');
  const navMenu = document.getElementById('nav-menu');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  
  const cartToggle = document.getElementById('cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartBadge = document.getElementById('cart-badge');
  
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartDiscountRow = document.getElementById('cart-discount-row');
  const cartDiscount = document.getElementById('cart-discount');
  const cartShipping = document.getElementById('cart-shipping');
  const cartTotal = document.getElementById('cart-total');
  const shippingProgressText = document.getElementById('shipping-progress-text');
  const shippingProgressBar = document.getElementById('shipping-progress-bar');
  
  const formulaTabs = document.querySelectorAll('.formula-tab-btn');
  const formulaDisplayCard = document.getElementById('formula-card-display');
  
  const shopSection = document.getElementById('shop');
  
  // Pre-Launch Lead Capture elements
  const checkoutModal = document.getElementById('checkout-modal');
  const prelaunchForm = document.getElementById('prelaunch-signup-form');
  const prelaunchThankyou = document.getElementById('prelaunch-thankyou-msg');
  const prelaunchCloseBtn = document.getElementById('prelaunch-close-btn');
  const formItemsCount = document.getElementById('form-items-count');
  
  // Analytics Dashboard elements
  const analyticsToggle = document.getElementById('analytics-toggle');
  const analyticsPanel = document.getElementById('analytics-panel');
  const analyticsCloseBtn = document.getElementById('analytics-close-btn');
  const btnClearAnalytics = document.getElementById('btn-clear-analytics');
  
  const statTraffic = document.getElementById('stat-traffic');
  const statLeads = document.getElementById('stat-leads');
  const statConversion = document.getElementById('stat-conversion');
  const regionChartList = document.getElementById('region-chart-list');
  const productChartList = document.getElementById('product-chart-list');
  const leadsTableElem = document.getElementById('leads-table-elem').querySelector('tbody');

  const playStoryBtn = document.getElementById('play-story-btn');
  const videoModal = document.getElementById('video-modal');
  const videoClose = document.getElementById('video-close');
  const currentYearSpan = document.getElementById('current-year');

  const liveVisitorTickerText = document.getElementById('live-visitor-ticker-text');

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 3. UI STATE TRANSITIONS & MENUS
  // ==========================================
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '5px 0';
      header.style.boxShadow = 'var(--shadow-soft)';
    } else {
      header.style.padding = '0';
      header.style.boxShadow = 'none';
    }
  });

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      mobileMenuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  if (shopSection) {
    shopSection.addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        const productCard = e.target.closest('.product-card');
        const purchaseOptions = productCard.querySelectorAll('.purchase-option');
        purchaseOptions.forEach(opt => opt.classList.remove('active'));
        e.target.closest('.purchase-option').classList.add('active');
      }
    });
  }

  // ==========================================
  // 4. RADICAL TRANSPARENCY FORMULA TABS
  // ==========================================
  formulaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      formulaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const formulaKey = tab.dataset.formula;
      renderFormulaCard(formulaKey);
    });
  });

  const renderFormulaCard = (key) => {
    const data = formulas[key];
    if (!data) return;

    let ingredientHtml = '';
    data.ingredients.forEach(ing => {
      ingredientHtml += `
        <div class="ingredient-block-item" style="--bg-color: ${ing.bg}; --text-color: ${ing.text};">
          <span class="pct">${ing.pct}</span>
          <span class="name">${ing.name}</span>
          <span class="sub">${ing.sub}</span>
        </div>
      `;
    });

    formulaDisplayCard.innerHTML = `
      <div class="formula-display-grid">
        <div class="formula-ingredients-list">
          ${ingredientHtml}
        </div>
        <div class="formula-product-showcase">
          <img src="${data.image}" alt="proTeen formula spread" class="formula-image active-image">
        </div>
      </div>
    `;
  };

  // Food Tech Secrets Accordion Trigger
  const secretsBtn = document.getElementById('tech-secrets-btn');
  const secretsContent = document.getElementById('tech-secrets-content');
  if (secretsBtn && secretsContent) {
    secretsBtn.addEventListener('click', () => {
      secretsBtn.classList.toggle('active');
      secretsContent.classList.toggle('active');
    });
  }

  // ==========================================
  // 5. SHOPPING CART ENGINE
  // ==========================================

  const toggleCartDrawer = (open = true) => {
    if (open) {
      cartDrawer.classList.add('active');
      cartDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      cartDrawer.classList.remove('active');
      cartDrawerOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

  if (cartToggle) cartToggle.addEventListener('click', () => toggleCartDrawer(true));
  if (cartClose) cartClose.addEventListener('click', () => toggleCartDrawer(false));
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', () => toggleCartDrawer(false));

  document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const img = btn.dataset.img;
      
      const productCard = btn.closest('.product-card');
      const variantKey = id.replace('proteen-', '').replace('brewd-', '');
      const selectedRadio = productCard.querySelector(`input[name="purchase-type-${variantKey}"]:checked`);
      const type = selectedRadio.value; // 'onetime' or 'subscribe'
      const price = parseFloat(type === 'onetime' ? btn.dataset.priceOnetime : btn.dataset.priceSubscribe);
      
      addToCart(id, type, name, price, img);
      
      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'Added to Basket! 🌾';
      btn.style.backgroundColor = 'var(--color-sage)';
      btn.style.color = '#ffffff';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
        toggleCartDrawer(true);
      }, 700);
    });
  });

  const addToCart = (id, type, name, price, img) => {
    const existingIndex = cart.findIndex(item => item.id === id && item.type === type);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ id, type, name, price, img, qty: 1 });
    }
    saveCart();
  };

  const updateQty = (id, type, newQty) => {
    const itemIndex = cart.findIndex(item => item.id === id && item.type === type);
    if (itemIndex > -1) {
      if (newQty <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].qty = newQty;
      }
      saveCart();
    }
  };

  const removeFromCart = (id, type) => {
    cart = cart.filter(item => !(item.id === id && item.type === type));
    saveCart();
  };

  const updateCartUI = () => {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalCount;
    
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <span class="empty-icon">🌾</span>
          <p>Your basket is currently empty.</p>
          <button class="btn btn-primary btn-sm close-cart-nav">Shop Fresh Batch</button>
        </div>
      `;
      const emptyNav = cartItemsList.querySelector('.close-cart-nav');
      if (emptyNav) emptyNav.addEventListener('click', () => toggleCartDrawer(false));
      document.getElementById('cart-footer').style.display = 'none';
      return;
    }

    document.getElementById('cart-footer').style.display = 'flex';
    
    let itemsHtml = '';
    cart.forEach(item => {
      const formattedType = item.type === 'subscribe' ? 'Subscription (Save 15% 🌾)' : 'One-time';
      itemsHtml += `
        <div class="cart-item">
          <div class="cart-item-img-box">
            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-type">${formattedType}</span>
            <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
            
            <div class="cart-item-qty-selector mt-2">
              <button class="qty-btn dec" data-id="${item.id}" data-type="${item.type}">&minus;</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn inc" data-id="${item.id}" data-type="${item.type}">&plus;</button>
            </div>
          </div>
          <div class="cart-item-remove" data-id="${item.id}" data-type="${item.type}">&times;</div>
        </div>
      `;
    });

    cartItemsList.innerHTML = itemsHtml;
    
    cartItemsList.querySelectorAll('.qty-btn.dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(i => i.id === btn.dataset.id && i.type === btn.dataset.type);
        if (item) updateQty(item.id, item.type, item.qty - 1);
      });
    });

    cartItemsList.querySelectorAll('.qty-btn.inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(i => i.id === btn.dataset.id && i.type === btn.dataset.type);
        if (item) updateQty(item.id, item.type, item.qty + 1);
      });
    });

    cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.id, btn.dataset.type);
      });
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    
    // Free Shipping at ₹250 threshold
    const shippingThreshold = 250;
    if (subtotal >= shippingThreshold) {
      cartShipping.textContent = 'FREE';
      cartShipping.style.color = 'var(--color-sage)';
      shippingProgressText.textContent = '✨ You unlocked Free Shipping!';
      shippingProgressBar.style.width = '100%';
      shippingProgressBar.style.backgroundColor = 'var(--color-sage)';
    } else {
      const difference = shippingThreshold - subtotal;
      cartShipping.textContent = '₹40.00';
      cartShipping.style.color = '';
      shippingProgressText.textContent = `Spend ₹${difference.toFixed(2)} more for Free Shipping!`;
      const pct = (subtotal / shippingThreshold) * 100;
      shippingProgressBar.style.width = `${pct}%`;
      shippingProgressBar.style.backgroundColor = '';
    }

    const shippingCost = subtotal >= shippingThreshold ? 0 : 40.00;
    const finalTotal = subtotal + shippingCost;
    cartTotal.textContent = `₹${finalTotal.toFixed(2)}`;
  };

  // ==========================================
  // 6. PRE-LAUNCH WAITLIST & EMAIL DISPATCH
  // ==========================================
  const triggerCheckoutFlow = () => {
    const itemsCountVal = cart.reduce((sum, item) => sum + item.qty, 0);
    if (formItemsCount) {
      formItemsCount.textContent = `${itemsCountVal} product${itemsCountVal > 1 ? 's' : ''}`;
    }
    
    if (prelaunchForm) prelaunchForm.style.display = 'block';
    if (prelaunchThankyou) prelaunchThankyou.style.display = 'none';
    
    toggleCartDrawer(false);
    checkoutModal.classList.add('active');
  };

  const closePrelaunchModal = () => {
    checkoutModal.classList.remove('active');
  };

  if (document.getElementById('btn-checkout')) {
    document.getElementById('btn-checkout').addEventListener('click', triggerCheckoutFlow);
  }
  
  if (prelaunchCloseBtn) prelaunchCloseBtn.addEventListener('click', closePrelaunchModal);
  if (checkoutModal) checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closePrelaunchModal();
  });

  // Client-Side Email dispatch (simulates / triggers EmailJS)
  const dispatchEmailJS = (leadData) => {
    const serviceId = document.getElementById('emailjs-service-id').value;
    const templateId = document.getElementById('emailjs-template-id').value;
    const publicKey = document.getElementById('emailjs-public-key').value;

    console.log('✉️ Attempting email dispatch via EmailJS...');
    
    if (typeof emailjs !== 'undefined' && publicKey !== 'user_placeholder') {
      // If client initializes EmailJS properly with their credentials
      emailjs.send(
        serviceId,
        templateId,
        {
          lead_name: leadData.name,
          lead_contact: leadData.contact,
          lead_region: leadData.region,
          cart_items: leadData.items,
          cart_value: leadData.cartValue,
          geo_details: leadData.geoDetails,
          order_id: leadData.id,
          timestamp: leadData.timestamp
        },
        publicKey
      ).then(
        () => console.log('✅ Email successfully dispatched via EmailJS!'),
        (err) => console.warn('❌ EmailJS dispatch failed (Check API configuration):', err)
      );
    } else {
      // Simulated Email Dispatch for Testing/Mocking
      console.log('✨ (EmailJS Simulation mode active) Email template prepared:');
      console.log(`To: proTeen Admin (waitlist@proteen.in)\nFrom: ${leadData.name} <${leadData.contact}>\nLocation: ${leadData.region}\nInterested in: ${leadData.items}\nCart Value: ${leadData.cartValue}`);
      console.log('✅ Email successfully logged to LocalStorage & Dev Panel. Config EmailJS public keys inside index.html for real triggers!');
    }
  };

  if (prelaunchForm) {
    prelaunchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('lead-name').value;
      const contact = document.getElementById('lead-contact').value;
      const region = document.getElementById('lead-region').value;
      
      const cartValue = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const itemsListed = cart.map(i => `${i.name} (x${i.qty})`).join(', ');

      const leadData = {
        id: `PT-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        name,
        contact,
        region,
        cartValue: `₹${cartValue.toFixed(2)}`,
        items: itemsListed,
        geoDetails: visitorGeo ? `${visitorGeo.ip} (${visitorGeo.isp})` : 'Unknown IP (Dev Mode)'
      };

      // Add to array and save
      visitorLeads.push(leadData);
      localStorage.setItem('proteen_leads', JSON.stringify(visitorLeads));
      
      // Dispatch email trigger
      dispatchEmailJS(leadData);
      
      // Update displays
      updateAnalyticsUI();
      
      // Show thank you pane
      prelaunchForm.style.display = 'none';
      prelaunchThankyou.style.display = 'flex';
      
      // Clear Cart
      cart = [];
      saveCart();

      setTimeout(() => {
        closePrelaunchModal();
      }, 5000);
    });
  }

  // ==========================================
  // 7. DYNAMIC LIVE VISITOR TICKER (FOOTER)
  // ==========================================
  const startVisitorTicker = () => {
    if (!liveVisitorTickerText) return;

    const phrases = [
      () => `LIVE: ${pageViews} visitors from Gurez, Srinagar, and New Delhi are exploring proTeen`,
      () => `LIVE: Visitor from ${visitorGeo ? visitorGeo.city : 'Mumbai'} is browsing proTeen Original bar`,
      () => {
        if (visitorLeads.length > 0) {
          const lastLead = visitorLeads[visitorLeads.length - 1];
          return `Waitlist update: ${lastLead.name} from ${lastLead.region.split(',')[0]} just pre-ordered!`;
        } else {
          return `LIVE: 12 people are exploring the Brew'd Stroopwafel Walnut Fills`;
        }
      },
      () => `LIVE: Direct farm-traceability verified in Gurez Valley for batch PT-2026`
    ];

    let phraseIndex = 0;
    const rotateTicker = () => {
      // Fade out effect
      liveVisitorTickerText.style.opacity = '0';
      
      setTimeout(() => {
        liveVisitorTickerText.textContent = phrases[phraseIndex]();
        liveVisitorTickerText.style.opacity = '1';
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }, 400);
    };

    rotateTicker();
    // Rotate every 8 seconds
    setInterval(rotateTicker, 8000);
  };

  // ==========================================
  // 8. DEV MARKET ANALYTICS DASHBOARD
  // ==========================================
  
  const toggleAnalyticsPanel = (open = true) => {
    if (open) {
      analyticsPanel.classList.add('active');
    } else {
      analyticsPanel.classList.remove('active');
    }
  };

  if (analyticsToggle) analyticsToggle.addEventListener('click', () => toggleAnalyticsPanel(true));
  if (analyticsCloseBtn) analyticsCloseBtn.addEventListener('click', () => toggleAnalyticsPanel(false));
  
  if (btnClearAnalytics) {
    btnClearAnalytics.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear visitor and lead data?')) {
        localStorage.removeItem('proteen_leads');
        localStorage.removeItem('proteen_pageviews');
        visitorLeads = [];
        pageViews = 1420;
        localStorage.setItem('proteen_pageviews', 1420);
        
        updateAnalyticsUI();
        alert('Analytics reset successfully.');
      }
    });
  }

  const updateAnalyticsUI = () => {
    if (statTraffic) statTraffic.textContent = pageViews;
    if (statLeads) statLeads.textContent = visitorLeads.length;
    
    if (statConversion) {
      const rate = pageViews > 0 ? (visitorLeads.length / pageViews) * 100 : 0;
      statConversion.textContent = `${rate.toFixed(1)}%`;
    }

    const regionCounts = {};
    visitorLeads.forEach(lead => {
      const regionClean = lead.region.trim().split(',')[0] || 'Unknown';
      regionCounts[regionClean] = (regionCounts[regionClean] || 0) + 1;
    });

    const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
    const maxRegionCount = sortedRegions.length > 0 ? sortedRegions[0][1] : 1;

    if (regionChartList) {
      if (sortedRegions.length === 0) {
        regionChartList.innerHTML = `<p class="chart-empty">Waiting for lead location entries...</p>`;
      } else {
        let regionHtml = '';
        sortedRegions.slice(0, 5).forEach(([name, count]) => {
          const pct = (count / maxRegionCount) * 100;
          regionHtml += `
            <div class="chart-bar-row">
              <div class="chart-bar-info">
                <span class="chart-bar-lbl">${name}</span>
                <span class="chart-bar-val">${count} Lead${count > 1 ? 's' : ''}</span>
              </div>
              <div class="chart-bar-outer">
                <div class="chart-bar-fill" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        });
        regionChartList.innerHTML = regionHtml;
      }
    }

    const productCounts = {
      'proTeen Original Bar': 0,
      'proTeen Dark Cocoa Bar': 0,
      'BREW\'D Walnut Morning Paste': 0,
      'Brew\'d Stroopwafel Walnut Fills': 0
    };

    visitorLeads.forEach(lead => {
      Object.keys(productCounts).forEach(prod => {
        if (lead.items.includes(prod)) {
          productCounts[prod] += 1;
        }
      });
    });

    const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const maxProductCount = sortedProducts.length > 0 && sortedProducts[0][1] > 0 ? sortedProducts[0][1] : 1;

    if (productChartList) {
      let productHtml = '';
      sortedProducts.forEach(([name, count]) => {
        const pct = count > 0 ? (count / maxProductCount) * 100 : 0;
        productHtml += `
          <div class="chart-bar-row">
            <div class="chart-bar-info">
              <span class="chart-bar-lbl">${name.replace('proTeen ', '').replace('BREW\'D ', '')}</span>
              <span class="chart-bar-val">${count} interested</span>
            </div>
            <div class="chart-bar-outer">
              <div class="chart-bar-fill" style="width: ${pct}%; background-color: var(--color-warm);"></div>
            </div>
          </div>
        `;
      });
      productChartList.innerHTML = productHtml;
    }

    if (leadsTableElem) {
      if (visitorLeads.length === 0) {
        leadsTableElem.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">No leads captured yet. Add items and complete the pre-order waitlist to log a lead!</td>
          </tr>
        `;
      } else {
        let tableHtml = '';
        [...visitorLeads].reverse().forEach(lead => {
          tableHtml += `
            <tr>
              <td>${lead.timestamp}</td>
              <td><strong>${lead.name}</strong></td>
              <td>${lead.contact}</td>
              <td>📍 ${lead.region}</td>
              <td><code>${lead.geoDetails}</code></td>
              <td><strong>${lead.cartValue}</strong></td>
            </tr>
          `;
        });
        leadsTableElem.innerHTML = tableHtml;
      }
    }
  };

  // ==========================================
  // 9. VIDEO MODAL PLAYER (YOUTUBE DISPATCH)
  // ==========================================
  const videoIframe = document.getElementById('video-iframe');

  if (playStoryBtn) {
    playStoryBtn.addEventListener('click', () => {
      videoModal.classList.add('active');
    });
  }

  const closeVideo = () => {
    videoModal.classList.remove('active');
    // Stop YouTube video playing by swapping src back and forth
    if (videoIframe) {
      const currentSrc = videoIframe.src;
      videoIframe.src = '';
      videoIframe.src = currentSrc;
    }
  };

  if (videoClose) videoClose.addEventListener('click', closeVideo);
  if (videoModal) videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
  });

  // ==========================================
  // 9.5. KERNEL HOVER BLUEPRINT INTERACTION
  // ==========================================
  const kernelHoverBox = document.getElementById('kernel-hover-box');
  const milletHighlightCard = document.querySelector('.millet-highlight-card');
  const kernelStateTitle = document.getElementById('kernel-state-title');
  const kernelStateDesc = document.getElementById('kernel-state-desc');

  if (kernelHoverBox) {
    kernelHoverBox.addEventListener('mouseenter', () => {
      if (milletHighlightCard) {
        milletHighlightCard.classList.add('highlight-active');
      }
      if (kernelStateTitle) {
        kernelStateTitle.textContent = 'Human Brain Blueprint';
      }
      if (kernelStateDesc) {
        kernelStateDesc.textContent = "Nature's neural blueprint matches Kagzi walnuts";
      }
    });

    kernelHoverBox.addEventListener('mouseleave', () => {
      if (milletHighlightCard) {
        milletHighlightCard.classList.remove('highlight-active');
      }
      if (kernelStateTitle) {
        kernelStateTitle.textContent = 'Kashmir Kagzi Walnut';
      }
      if (kernelStateDesc) {
        kernelStateDesc.textContent = 'Hover to reveal the brain-shaped blueprint';
      }
    });
  }

  // ==========================================
  // 10. SCROLL INTERSECTION OBSERVER ANIMATIONS
  // ==========================================
  const animatedElements = document.querySelectorAll('.science-card, .ingredient-block-item, .product-card, .trace-content, .qr-scanner-card, .bh-stat-card, .kashmir-lady-card');
  
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-reveal');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    el.classList.add('reveal-hidden');
    observer.observe(el);
  });

  // ==========================================
  // INITIALIZE EXECUTION
  // ==========================================
  loadState();
  detectLocation();
});
