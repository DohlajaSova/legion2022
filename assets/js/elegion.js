function docReady(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

function findOffset(element) {
    var top = 0, left = 0;

    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
}

function objToQuery(obj) {
  // Convert flat map to query string.
  let str = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  let x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

function ContactMap(container, switcherItems, selectControl)
{
  function init() {
    let map = new google.maps.Map(container);
    initMap(map);
    initSwitcher(map);
    putMarkers(map);
    drawRoutes(map);
  }

  function initMap(map) {
    let opts = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      panControl: true,
      panControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: true,
      overviewMapControl: true,
      overviewMapControlOptions: {
        opened: true
      }
    };
    map.setOptions(opts);
  }

  function toggleActiveTab(target) {
    let clickedIndex = 0;
    if (target.parentNode){
        clickedIndex = Array.from(Array.prototype.slice.call(selectControl.children)[2].children).indexOf(target);
        let cityTabs = Array.prototype.slice.call(Array.prototype.slice.call(selectControl.children)[2].children);
        for (let item of cityTabs) {
          item.classList.remove('same-as-selected');
        }
        cityTabs[clickedIndex].classList.add('same-as-selected');
    }
    return clickedIndex;
  }

  function toggleActiveText(index) {
    for (let item of switcherItems) {
      item.classList.remove('active');
    }
    switcherItems[index].classList.add('active');
  }

  function centerMap(map, lat, lng, zoom) {
    let center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
    map.setZoom(parseInt(zoom));
  }

  function initSwitcher(map) {
    let onClick = function() {
      let clickedIndex = toggleActiveTab(this);
      let data = switcherItems[clickedIndex].dataset;// номер кликнутого
      toggleActiveText(clickedIndex);
      let lat = data.centerLat || data.markerLat;
      let lng = data.centerLng || data.markerLng;
      centerMap(map, lat, lng, data.zoom);
    };
    for (let item of Array.prototype.slice.call(selectControl.children)[2].children) {
      item.addEventListener('click', onClick);
    }
    onClick.apply(selectControl[0]);
  }

  function putMarkers(map) {
    let icon = {
      url: container.dataset.markerImage,
      size: new google.maps.Size(48, 48),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(24, 48)
    };
    for (let item of switcherItems) {
      let data = item.dataset;
      let position = new google.maps.LatLng(data.markerLat, data.markerLng);
      new google.maps.Marker({ map, position, icon });
    }
  }

  function drawRoutes(map) {
    for (let item of switcherItems) {
      let data = item.dataset;
      if (!data.routePoints) {
        continue;
      }
      let points = data.routePoints.split('; ').map((x) => x.split(',').map(parseFloat));
      let path = points.map((pt) => new google.maps.LatLng(pt[0], pt[1]));
      new google.maps.Polyline({
        map: map,
        path: path,
        geodesic: true,
        strokeColor: 'rgb(35, 168, 224)',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
    }
  }

  function load() {
    window.map_initialized = function() { init(); };
    let getUrl = function() {
      let base = 'https://maps.googleapis.com/maps/api/js';
      let options = {
        key: container.dataset.apiKey,
        language: container.dataset.language,
        callback: 'map_initialized'
      };
      let args = objToQuery(options);
      return [base, args].join('?');
    };
    let script = document.createElement("script");
    script.src = getUrl();
    document.body.appendChild(script);
  }

  if (container) {
    load();
  }
}

function TextareaOnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
}

function portfolioRefresh(limit){
    let portfolioBlocks = document.querySelectorAll(".js-cases-container-portfolio .container_portfolio-inner")[0];
    let shown = 0;
    for (let i=0; i<portfolioBlocks.children.length; i++){
        portfolioBlocks.children[i].classList.add("not-shown");
    }
    for (let i=0; i<portfolioBlocks.children.length; i++){
        if (!portfolioBlocks.children[i].classList.contains("hide")){
            shown++;
            if (shown <= limit)
                portfolioBlocks.children[i].classList.remove("not-shown");
        }
        
    }
}

docReady(function() {
    // фиксим хедер при скролле
    var stickyHeader = document.getElementsByClassName('header')[0];
    var headerOffset = findOffset(stickyHeader);
    var lastScrollTop = 0;
    var windowWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    if (windowWidth <= 550)
    {
        window.onscroll = function() {
            var bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            if (bodyScrollTop > 50){
                stickyHeader.classList.add('header_scrolled');
            } else {
                stickyHeader.classList.remove('header_scrolled');
            }

            if (bodyScrollTop > lastScrollTop || bodyScrollTop < 50){
                stickyHeader.classList.remove('header_sticky');
            } else {
                stickyHeader.classList.add('header_sticky');
            }
            lastScrollTop = bodyScrollTop <= 0 ? 0 : bodyScrollTop;
        };
    }
    
    // слайдер с проектом
    var sliderDots = document.querySelectorAll(".js-cases-dots");
    for (var i=0; i<sliderDots.length; i++){
        sliderDots[i].addEventListener("click", function(e){
            e.preventDefault();
            var slider = this.previousElementSibling; // контейнер со слайдами
            var sliderControlsContainer = this; // кликнутая точка
            if (e.target.tagName == "A")
            {
                var sliderControls = Array.prototype.slice.call(e.target.parentNode.parentNode.children); // контейнер с точками
                var clickedItemNumber = sliderControls.indexOf(e.target.parentNode); // номер кликнутого элемента
                for (var i=0; i<slider.children.length; i++){
                    slider.children[i].classList.remove("active");
                    sliderControls[i].classList.remove("active");
                }
                slider.children[clickedItemNumber].classList.add("active");
                sliderControls[clickedItemNumber].classList.add("active");
            }
        }, false);
    }
    
    // слайдер с информацией
    var sliderInfoDots = document.querySelectorAll(".js-cases-info-dots");
    for (var i=0; i<sliderInfoDots.length; i++){
        sliderInfoDots[i].addEventListener("click", function(e){
            e.preventDefault();
            var slider = this.parentNode.previousElementSibling; // контейнер со слайдами
            var sliderControlsContainer = this; // кликнутая точка
            if (e.target.tagName == "A")
            {
                var sliderControls = Array.prototype.slice.call(e.target.parentNode.parentNode.children); // контейнер с точками
                var clickedItemNumber = sliderControls.indexOf(e.target.parentNode); // номер кликнутого элемента
                for (var i=0; i<slider.children[0].children.length; i++){
                    slider.children[0].children[i].classList.remove("active");
                    sliderControls[i].classList.remove("active");
                }
                slider.children[0].children[clickedItemNumber].classList.add("active");
                sliderControls[clickedItemNumber].classList.add("active");
            }
        }, false);
    }
    
    // слайдер с принципами
    var sliderProblemsDots = document.querySelectorAll(".js-problems-groups-dots");
    for (var i=0; i<sliderProblemsDots.length; i++){
        /*sliderProblemsDots[i].addEventListener("click", function(e){
            e.preventDefault();
            var slider = this.parentNode.previousElementSibling; // контейнер со слайдами
            var sliderControlsContainer = this; // кликнутая точка
            if (e.target.tagName == "A")
            {
                var sliderControls = Array.prototype.slice.call(e.target.parentNode.parentNode.children); // контейнер с точками
                var clickedItemNumber = sliderControls.indexOf(e.target.parentNode); // номер кликнутого элемента
                for (var i=0; i<slider.children[0].children[0].children.length; i++){
                    slider.children[0].children[0].children[i].classList.remove("active");
                    sliderControls[i].classList.remove("active");
                }
                slider.children[0].children[0].children[clickedItemNumber].classList.add("active");
                sliderControls[clickedItemNumber].classList.add("active");
            }
        }, false);*/
    }
    if (document.querySelectorAll(".js-problems-slider-groups").length > 0)
    {
        var sliderProblems = tns({
            container: '.js-problems-slider-groups',
            items: 1,
            controls: false,
            navPosition: 'bottom',
            navContainer: '.js-problems-groups-dots',
            mouseDrag: true,
            slideBy: 'page'
        });
    }

    // слайдер со статьями
    if (document.querySelectorAll(".js-project-article").length > 0)
    {
        var sliderProjects = tns({
            container: '.js-project-article',
            items: 1,
            controls: false,
            navPosition: 'bottom',
            navContainer: '.js-project-article-dots',
            mouseDrag: true,
            slideBy: 'page'
        });
    }
    
    // блок с кейсами
    if (document.querySelectorAll(".js-cases-container").length > 0)
    {
        let container = document.querySelector(".js-cases-container");
        let cases = Array.prototype.slice.call(container.children);

        let block = new Array();
        let curBlock = 0;
        let count = 1;
        let limit = 4;
        
        let sliderContainer = document.createElement("div");
        sliderContainer.className = "cases-container__inner js-cases-container-inner";
        container.appendChild(sliderContainer);
        
        for (i=0; i<cases.length; i++){
            if (cases[i].classList.contains("cases__case"))
            {
                if (count == 1){
                    curBlock++;
                    block[curBlock] = document.createElement("div");
                    block[curBlock].className = "cases__block";
                    sliderContainer.appendChild(block[curBlock]);
                }
                if (cases[i].classList.contains("cases__case_double") && (count <= limit-1))
                {
                    block[curBlock].insertAdjacentElement('beforeEnd', cases[i]);
                    count++;
                }
                else if ((!cases[i].classList.contains("cases__case_double")) && (count <= limit))
                {
                    block[curBlock].insertAdjacentElement('beforeEnd', cases[i]);
                }
                count++;
                if (count > limit)
                    count = 1;
            }
        }
        if (windowWidth <= 650){
            var sliderCases = tns({
                container: '.js-cases-container-inner',
                items: 1,
                gutter: 15,
                axis: "horizontal",
                controls: false,
                navPosition: 'bottom',
                mouseDrag: true,
                slideBy: 'page'
            });
        }
        else{
            var sliderCases = tns({
                container: '.js-cases-container-inner',
                items: 2,
                gutter: 15,
                axis: "vertical",
                controls: false,
                navPosition: 'bottom',
                mouseDrag: true,
                slideBy: 'page'
            });
        }
    }
    
    // фильтр на странице портфолио
    let portfolioBlocks = document.querySelectorAll(".js-cases-container-portfolio .container_portfolio-inner");
    let portfolioTypes = document.querySelectorAll(".js-cases-types");
    let portfolioTags = document.querySelectorAll(".js-cases-tags");

    if (portfolioBlocks.length >0)
    {
        let curLimit = document.querySelectorAll(".js-cases-container-portfolio")[0].dataset.limit*1;
        let moreButton = document.querySelectorAll(".js-cases-more")[0];
        moreButton.addEventListener("click", function(e){
            e.preventDefault();
            curLimit += 4;
            portfolioRefresh(curLimit);
        })
        portfolioRefresh(curLimit);

        for (var i=0; i<portfolioTypes.length; i++){
            let types = new Array();
            for (var j=0; j<portfolioBlocks[0].children.length; j++){
                let typeString = portfolioBlocks[0].children[j].dataset.types.slice(1,portfolioBlocks[0].children[j].dataset.types.length-1);
                types[j] = typeString.split(",");
            }

            portfolioTypes[i].addEventListener("click", function(e){
                let options = e.target.parentNode.parentNode.childNodes[0];
                e.preventDefault();
                let selectedType = options.selectedOptions[0].value;

                for (var j=0; j<types.length; j++){
                    if (!types[j].includes("'" + selectedType + "'")){
                        portfolioBlocks[0].children[j].classList.add("hide");
                    }
                    else{
                        portfolioBlocks[0].children[j].classList.remove("hide");
                    }
                }
                portfolioRefresh(curLimit);
            })
        }
        for (var i=0; i<portfolioTags.length; i++){
            let tags = new Array();
            for (var j=0; j<portfolioBlocks[0].children.length; j++){
                let tagString = portfolioBlocks[0].children[j].dataset.tags.slice(1,portfolioBlocks[0].children[j].dataset.tags.length-1);
                tags[j] = tagString.split(",");
            }

            portfolioTags[i].addEventListener("click", function(e){
                e.preventDefault();
				let selectedTag;
				if (e.target.getAttribute("href") != null){
					selectedTag = e.target.getAttribute("href").slice(1);
					for (var j=0; j<portfolioTags[0].children.length; j++){
						portfolioTags[0].children[j].classList.remove("active");
					}
					e.target.classList.add("active");
					for (var j=0; j<tags.length; j++){
						if (!tags[j].includes("'" + selectedTag + "'")){
							portfolioBlocks[0].children[j].classList.add("hide");
						}
						else{
							portfolioBlocks[0].children[j].classList.remove("hide");
						}
					}
					portfolioRefresh(curLimit);
				}
            })
        }
    }

    // блок вакансий
    var vacancyBlocks = document.querySelectorAll(".vacancy");
    for (var i=0; i<vacancyBlocks.length; i++){
        vacancyBlocks[i].addEventListener("mouseover", function(e){
            e.preventDefault();
            var vacancyContainer = this.children[0]; // контейнер с вакансией
            var vacancyContainerHeight = vacancyContainer.getBoundingClientRect().height;
            var vacancyName = vacancyContainer.getElementsByClassName("vacancy__title_name")[0];
            var vacanceNameHeight = vacancyName.getBoundingClientRect().height+50;
            var vacancyTitle = vacancyName.parentNode;
            var vacancyBody = vacancyTitle.nextElementSibling;
            vacancyTitle.style.top = vacanceNameHeight - vacancyContainerHeight + "px";
            vacancyBody.style.top = vacanceNameHeight - vacancyContainerHeight + "px";
            vacancyBody.style.height = vacancyContainerHeight - vacanceNameHeight + 92 + "px";
        }, false);
        vacancyBlocks[i].addEventListener("mouseout", function(e){
            e.preventDefault();
            var vacancyContainer = this.children[0]; // контейнер с вакансией
            var vacancyName = vacancyContainer.getElementsByClassName("vacancy__title_name")[0];
            var vacancyTitle = vacancyName.parentNode;
            var vacancyBody = vacancyTitle.nextElementSibling;
            vacancyTitle.style.top = "0px";
            vacancyBody.style.top = "0px";
            vacancyBody.style.height = "100%";
        }, false);
    }
    
    // выпадающее меню
    var pmenuToggler = document.querySelector(".js-top-menu");
    var pmenuTogglerInner = document.querySelector(".js-top-menu-inner");
    var pmenuBody = document.querySelector(".pmenu");
    pmenuToggler.addEventListener("click", function(e){
        e.preventDefault();
        if (pmenuBody.classList.contains("active"))
        {
            pmenuBody.classList.remove("active");
            pmenuToggler.parentNode.classList.remove("active");
            document.querySelector("body").classList.remove("popup-open");
        }
        else
        {
            pmenuBody.classList.add("active");
            pmenuToggler.parentNode.classList.add("active");
            document.querySelector("body").classList.add("popup-open");
        }
    }, false);
    pmenuTogglerInner.addEventListener("click", function(e){
        e.preventDefault();
        if (pmenuBody.classList.contains("active"))
        {
            pmenuBody.classList.remove("active");
            pmenuToggler.parentNode.classList.remove("active");
            document.querySelector("body").classList.remove("popup-open");
        }
    }, false);

    // видео: пропорции
    var players = ['iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]'];
    var fitVideos = document.querySelectorAll(players.join(","));
    if (fitVideos.length) {
        for (var i = 0; i < fitVideos.length; i++) {
            // Get Video Information
            var fitVideo = fitVideos[i];
            var width = fitVideo.getAttribute("width");
            var height = fitVideo.getAttribute("height");
            var aspectRatio = height / width;
            var parentDiv = fitVideo.parentNode;

            var div = document.createElement("div");
            div.className = "popup-video__frame";
            div.style.paddingBottom = aspectRatio * 100 + "%";
            parentDiv.insertBefore(div, fitVideo);
            fitVideo.remove();
            div.appendChild(fitVideo);

            fitVideo.removeAttribute("height");
            fitVideo.removeAttribute("width");
        }
    }

    // автомасштабирование textarea
    const textarea = document.getElementsByTagName("textarea");
    if (textarea.length){
        for (let i = 0; i < textarea.length; i++) {
          textarea[i].setAttribute("style", "height:" + (textarea[i].scrollHeight) + "px;overflow-y:hidden;");
          textarea[i].addEventListener("input", TextareaOnInput, false);
        }
    }
    
    // слайдер типа range
	const range = document.querySelector(".range");
	if (range != null){
		document.querySelector(".range").classList.add('js');
		
		function rangeMonitor(e){
			let _t;
			if (e == undefined) _t = document.querySelectorAll('.range input[type="range"]')[0];
			else _t = _t = e.target; 
			let _p = _t.parentNode, 
				val = +_t.value,
				_o = _p.querySelector(`option[value='${val}']`), 
				lbl = +_o.label;
	
			_t.setAttribute('aria-valuetext', lbl);
			_p.style.setProperty(`--${_t.id}`, val);
			_p.style.setProperty(`--lbl-${_t.id}`, lbl+"");
			_p.style.setProperty(`--wd`, _p.clientWidth);
		}
	
		document.querySelectorAll('.range input[type="range"]')[0].addEventListener('input', rangeMonitor, false);
		document.querySelectorAll('.range input[type="range"]')[1].addEventListener('input', rangeMonitor, false);
		rangeMonitor();
	}
    
    // выпадающее видео
    var videoOpener = document.querySelector(".js-popup-video-open");
    var videoCloser = document.querySelector(".js-popup-video-close");
    var videoBody = document.querySelector(".popup-video");
    if (videoOpener!= null) {
        videoOpener.addEventListener("click", function(e){
            e.preventDefault();
            videoBody.classList.add("active");
            document.querySelector("body").classList.add("popup-open");
        }, false);
        videoCloser.addEventListener("click", function(e){
            e.preventDefault();
            videoBody.classList.remove("active");
            document.querySelector("body").classList.remove("popup-open");
        }, false);
    }
    
    // выпадающая форма обратной связи
    var feedbackOpener = document.querySelectorAll(".js-popup-feedback-open");
    var feedbackCloser = document.querySelector(".js-popup-feedback-close");
    for (var i=0; i<feedbackOpener.length; i++){
        var feedbackBody = document.querySelector(".popup-feedback");
        if (feedbackOpener[i]!= null) {
            feedbackOpener[i].addEventListener("click", function(e){
                e.preventDefault();
                feedbackBody.classList.add("active");
                document.querySelector("body").classList.add("popup-open");
            }, false);
            feedbackCloser.addEventListener("click", function(e){
                e.preventDefault();
                feedbackBody.classList.remove("active");
                document.querySelector("body").classList.remove("popup-open");
            }, false);
        }
    }
    
    // круг с цифрами
    var circle = document.querySelector(".circle");
    var circleText = document.querySelector(".circle-text");
    var circlePic = document.querySelector(".circle-pic");
    
    if (circlePic!= null) {
        circlePic.classList.add("rotating");
        var num = 2;
        setInterval(function(){
            //circlePic.style.transform = "rotate("+ 360*num + "deg)";
            for (var i=0; i<circleText.children.length; i++){
                circleText.children[i % circleText.children.length].style.display = "none";
            }
            circleText.children[num % circleText.children.length].style.display = "block";
            num++;
        }, 5000);
    }
    
    if (document.querySelector('.js-map-container'))
    {
        new ContactMap(document.querySelector('.js-map-container'),
            document.querySelectorAll('.js-map-address'),
            document.querySelector('.js-map-select'));
    }
    
    // кастомный селект
    if (document.querySelector('.select'))
    {
        let x, i, j, l, ll, selElmnt, a, b, c;
        /* Look for any elements with the class "select": */
        x = document.getElementsByClassName("select");
        l = x.length;
        for (i = 0; i < l; i++) {
          selElmnt = x[i].getElementsByTagName("select")[0];
          ll = selElmnt.length;
          /* For each element, create a new DIV that will act as the selected item: */
          a = document.createElement("DIV");
          a.setAttribute("class", "select-selected");
          a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
          x[i].appendChild(a);
          /* For each element, create a new DIV that will contain the option list: */
          b = document.createElement("DIV");
          b.setAttribute("class", "select-items select-hide");
          for (j = 0; j < ll; j++) {
            /* For each option in the original select element,
            create a new DIV that will act as an option item: */
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            if (j == 0) {c.setAttribute("class", "same-as-selected");}
            /*custom options*/
            if  (selElmnt.options[j].value == "ios" ||
                 selElmnt.options[j].value == "android" ||
                 selElmnt.options[j].value == "web" ||
                 selElmnt.options[j].value == "other")
            {
                newClass = "iconed_" + selElmnt.options[j].value;
                c.classList.add("iconed");
                c.classList.add(newClass);
            }
            c.addEventListener("click", function(e) {
                /* When an item is clicked, update the original select box,
                and the selected item: */
                let y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                  if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                      y[k].classList.remove("same-as-selected");
                    }
                    this.classList.add("same-as-selected");
                    break;
                  }
                }
                h.click();
            });
            b.appendChild(c);
          }
          x[i].appendChild(b);
          a.addEventListener("click", function(e) {
            /* When the select box is clicked, close any other select boxes,
            and open/close the current select box: */
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
          });
        }

        /* If the user clicks anywhere outside the select box,
        then close all select boxes: */
        document.addEventListener("click", closeAllSelect);
    }

    // блок с фото сотрудников
    if (document.querySelectorAll(".js-team-container").length > 0)
    {
        let container = document.querySelector(".js-team-container");
        let cases = Array.prototype.slice.call(container.children);

        var sliderTeam = tns({
            container: '.js-team-container .team__list',
            items: 4,
            gutter: 15,
            axis: "horizontal",
            controls: false,
            navPosition: 'bottom',
            mouseDrag: true,
            slideBy: 'page'
        });
    }

    // блок с рандомными проектами
    if (document.querySelectorAll(".js-randomcases-container").length > 0)
    {
        let container = document.querySelector(".js-randomcases-container");
        let cases = Array.prototype.slice.call(container.children);

        var sliderCases = tns({
            container: '.js-randomcases-container .some-projects__list',
            items: 4,
            gutter: 15,
            controls: false,
            nav: false,
            //navPosition: 'bottom',
            mouseDrag: true,
            slideBy: 'page'
        });
    }

    // аккордеон
    if (document.querySelectorAll(".js-accordion").length > 0)
    {
        let container = document.querySelector(".js-accordion");
        let accItems = Array.prototype.slice.call(container.children);
        for (var i=0; i<accItems.length; i++){
            accItems[i].addEventListener("click", function(e){
                e.preventDefault();
                e.target.parentNode.classList.toggle("active");
            }, false);
        }
    }

});