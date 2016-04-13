jQuery("#toc-link").click(function() {
    jQuery("#toc").toggle();
    $("#toc-link").animate({
        rotate: '+=-40deg'
    }, 0);
})