// JavaScript Document
$(document).ready(function () {

	var selector = '#Home';
	var baseOpacity = '.6';
	var fadeInVal = '1';
	var fadeSpeed = '1000';
	$(selector)
	.css('opacity',baseOpacity)
	.mouseover(function(){
		$(this).stop().animate({'opacity':fadeInVal},fadeSpeed);
	})
	.mouseout(function(){
		$(this).stop().animate({'opacity':baseOpacity},fadeSpeed);
	});
	
	var selector = '#SignedIn';
	var baseOpacity = '.6';
	var fadeInVal = '1';
	var fadeSpeed = '1000';
	$(selector)
	.css('opacity',baseOpacity)
	.mouseover(function(){
		$(this).stop().animate({'opacity':fadeInVal},fadeSpeed);
	})
	.mouseout(function(){
		$(this).stop().animate({'opacity':baseOpacity},fadeSpeed);
	});
	
	var selector = '#Game';
	var baseOpacity = '.6';
	var fadeInVal = '1';
	var fadeSpeed = '1000';
	$(selector)
	.css('opacity',baseOpacity)
	.mouseover(function(){
		$(this).stop().animate({'opacity':fadeInVal},fadeSpeed);
	})
	.mouseout(function(){
		$(this).stop().animate({'opacity':baseOpacity},fadeSpeed);
	});


});