$(document).ready(function(){

  var _window = $(window);
  var _document = $(document);

  var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  function pageReady(){
    legacySupport();

    initPopups();
    initSliders();
    initRangeSlider();
    initLazyLoad();
    initPS();

    // development helper
    _window.on('resize', debounce(setBreakpoint, 200))
  }

  // this is a master function which should have all functionality
  pageReady();


  // some plugins work best with onload triggers
  _window.on('load', function(){
    // your functions
  })


  //////////
  // COMMON
  //////////

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: true,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }

  // Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
  		e.preventDefault();
  	})

  //////////
  // CATALOG
  //////////

  _document.on('click', '.sidebar__group-head', function(){
    var parent = $(this).parent();
    $(this).toggleClass('is-active');
    parent.find('.sidebar__group-contents').slideToggle()
  })

  //////////
  // TOPBAR
  //////////

  _document.on('click', '[js-topbar]', function(){
    $(this).toggleClass('is-active')
  })


  //////////
  // SLIDERS
  //////////

  function initSliders(){
    var swiper = new Swiper ('[js-slider]', {
      direction: 'horizontal',
      // loop: true,
      watchOverflow: true,
      spaceBetween: 6,
      slidesPerView: 'auto',
      // normalizeSlideIndex: true,
      // centeredSlides: true,
      freeMode: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })

    swiper.on('touchStart', function(){
      $('[js-slider]').addClass('is-moving');
    })
    swiper.on('slideChangeTransitionStart', function(){
      $('[js-slider]').addClass('is-moving');
    })
    swiper.on('sliderMove', function(){
      $('[js-slider]').addClass('is-moving');
    })
    swiper.on('touchEnd', function(){
      $('[js-slider]').removeClass('is-moving');
    })
    swiper.on('slideChangeTransitionEnd', function(){
      $('[js-slider]').removeClass('is-moving');
    })

  }

  //////////
  // MODALS
  //////////

  function initPopups(){
    // Magnific Popup
    $('[js-ajax-popup]').magnificPopup({
      type: 'ajax',
      fixedContentPos: true,
      fixedBgPos: true,
      alignTop: true,
      overflowY: 'auto',
      closeBtnInside: true,
      closeOnContentClick: false,
      closeMarkup: '<button title="%title%" type="button" class="mfp-close"><svg class="ico ico-close"><use xlink:href="img/sprite.svg#ico-close"></use></svg></button>',
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble',
    });

  }

  function closeMfp(){
    $.magnificPopup.close();
  }


  ////////////
  // RANGESLIDER
  ////////////
  function initRangeSlider(){
    var range = $('.ui-range').get(0)
    if ( range ){
      noUiSlider.create(range, {
        start: [ 2399, 8399 ],
        // margin: 300,
        // limit: 600,
        connect: true,
        behaviour: 'tap-drag',
        step: 100,
        range: {
          'min': 399,
          'max': 12999
        },
      });

      var valuesDivs = [
        $('.ui-range__from'),
        $('.ui-range__to')
      ];

      // When the slider value changes, update the input and span
      range.noUiSlider.on('update', function( values, handle ) {
        valuesDivs[handle].html(numberWithThousands(Math.floor(values[handle])));
      });
    }

  }

  function numberWithThousands(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function initPS(){
    var catalogCat = document.querySelector('.catalog__category');
    if ( catalogCat ){
      new PerfectScrollbar(catalogCat);
    }

    var sidebar = document.querySelector('.sidebar__wrapper');
    if ( sidebar ){
      new PerfectScrollbar(sidebar);
    }
  }


  ////////////
  // UI
  ////////////

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
    });


  //////////
  // LAZY LOAD
  //////////
  function initLazyLoad(){
    _document.find('[js-lazy]').Lazy({
      threshold: 500,
      enableThrottle: true,
      throttle: 100,
      scrollDirection: 'vertical',
      effect: 'fadeIn',
      effectTime: 500,
      // visibleOnly: true,
      // placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7...",
      onError: function(element) {
          console.log('error loading ' + element.data('src'));
      },
      beforeLoad: function(element){
        // element.attr('style', '')
      }
    });
  }

  //////////
  // BARBA PJAX
  //////////

  Barba.Pjax.Dom.containerClass = "page";

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      var deferred = Barba.Utils.deferred();

      anime({
        targets: this.oldContainer,
        opacity : .5,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim){
          deferred.resolve();
        }
      })

      return deferred.promise
    },

    fadeIn: function() {
      var _this = this;
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      $el.css({
        visibility : 'visible',
        opacity : .5
      });

      anime({
        targets: "html, body",
        scrollTop: 0,
        easing: easingSwing, // swing
        duration: 150
      });

      anime({
        targets: this.newContainer,
        opacity: 1,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim) {
          triggerBody()
          _this.done();
        }
      });
    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function() {
    return FadeTransition;
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {

    pageReady();

  });

  // some plugins get bindings onNewPage only that way
  function triggerBody(){
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint(){
    var wHost = window.location.host.toLowerCase()
    var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
    if (displayCondition){
      var wWidth = _window.width();
      var wHeight = _window.height();

      var content = "<div class='dev-bp-debug'>"+wWidth+ "/" + wHeight + "</div>";

      $('.page').append(content);
      setTimeout(function(){
        $('.dev-bp-debug').fadeOut();
      },1000);
      setTimeout(function(){
        $('.dev-bp-debug').remove();
      },1500)
    }
  }

});
