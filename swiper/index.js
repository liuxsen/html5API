(function(w, $) {
    function Swiper(obj) {
        console.log(obj)
        this.swipeClass = obj.className;
        this.autoplay = obj.autoplay;
        this.timer = null;
        this.activeIndex = 0;
        this.slidePreview = obj.slidePreview || 3;
        this.spaceBetween = 0 || obj.spaceBetween;
        this.speed = obj.speed || 500;
        this.isAnimating = false;
        this.slides = 0;
        this.stepLong = 0;
    }
    Swiper.prototype = {
        init: function() {
            if (this.timer) {
                this.stopAutoplay();
            }
            var boxClass = this.swipeClass;
            var parentWidth = $(boxClass).parent().width();
            var spaceBetween = this.spaceBetween;
            $(boxClass).find('.swiper-slide').addClass('default').css({ width: (1 / this.slidePreview) * parentWidth, 'padding': spaceBetween });
            var slides = this.slides = $(boxClass).find('.swiper-slide.default');
            //给轮播中的slide添加索引
            $(boxClass).find('.swiper-slide').each(function(i, slide) {
                $(slide).attr('dataIndex', i)
            });
            var stepLong = this.stepLong = $(boxClass).find('.swiper-slide').eq(0).outerWidth();
            this.preInit();
            this.refreshTipsAndNum();
            this.addSlideTo();
        },
        setSpeed: function(speed) {
            speed = speed * 1;
            this.stopAutoplay();
            this.speed = speed;
            this.startAutoplay();
        },
        setWidth: function(widthVal) {
            this.width = widthVal * 1;
            var stepLong = this.stepLong = this.width / this.slidePreview;
            var boxClass = this.swipeClass;
            var parentWidth = $(boxClass).parent().width();
            $(boxClass).find('.swiper-slide').css({ width: (1 / this.slidePreview) * parentWidth });
            this.stopAutoplay();
            $(boxClass).css({ 'marginLeft': -this.slidePreview * this.stepLong });
            $(".swiper-pagination span").removeClass('active').eq(0).addClass('active')
            this.activeIndex = 0;
            this.startAutoplay();
        },
        setPreview: function(val) {
            this.slidePreview = val * 1;
            this.stopAutoplay();
            var boxClass = this.swipeClass;
            var parentWidth = $(boxClass).parent().width();
            $(boxClass).find('.swiper-slide').css({ width: (1 / this.slidePreview) * parentWidth });
            this.stepLong = $(boxClass).find('.swiper-slide').outerWidth();
            this.stopAutoplay();
            var defaultSlide = $(boxClass).find('.swiper-slide.default').clone();
            $(boxClass).find('.swiper-slide').remove();
            $(boxClass).prepend(defaultSlide);
            this.preInit();
            this.activeIndex = 0;
            $(".swiper-pagination span").removeClass('active').eq(0).addClass('active')
                // $(boxClass).css({ 'marginLeft': -this.slidePreview * this.stepLong });
            this.startAutoplay();
        },
        /*
         * 复制，为循环做准备
         * */
        preInit: function() {
            var boxClass = this.swipeClass;
            var stepLong = $(boxClass).find('.swiper-slide').outerWidth();
            var slidePreview = this.slidePreview;
            var slides = this.slides.length;
            var prevClone = $(boxClass).find('.swiper-slide').eq(slidePreview).prevAll().clone().removeClass('default').addClass('clone-prev');
            var afterClone = $(boxClass).find('.swiper-slide').eq(this.slides.length - slidePreview - 1).nextAll().clone().removeClass('default').addClass('clone-after');
            for (var i = prevClone.length; i--;) {
                $(boxClass).append(prevClone.eq(i));
            }
            for (var j = afterClone.length; j--;) {
                $(boxClass).prepend(afterClone.eq(j));
            }
            $(boxClass).css({ 'marginLeft': -this.slidePreview * this.stepLong });
        },
        stopAutoplay: function() {
            var timer = this.timer;
            clearInterval(timer);
            this.isAnimating = false;
        },
        // 正向动画逻辑
        doPlay: function() {
            var boxClass = this.swipeClass;
            var stepLong = this.stepLong;
            var left = Math.ceil(Math.abs($(boxClass).css('marginLeft').replace('px', '') * 1));
            var allLong = stepLong * this.slides.length;
            var that = this;

            that.stopAutoplay();
            $(boxClass).animate({
                'marginLeft': -(left + stepLong)
            }, that.speed, function() {
                console.log(that.speed)
                var left = Math.abs($(boxClass).css('marginLeft').replace('px', '') * 1);
                if (left - stepLong * (that.slidePreview + that.slides.length) > -5) {
                    $(boxClass).css({ 'marginLeft': -that.slidePreview * that.stepLong })
                }
                that.activeIndex++;
                if (that.activeIndex > that.slides.length - 1) {
                    that.activeIndex = 0;
                }
                that.activeTips(that.activeIndex);
                that.startAutoplay();
                that.isAnimating = false;
            })
        },
        //高亮当前的tip按钮；
        activeTips: function(index) {
            var boxClass = this.swipeClass;
            $(boxClass).parent().find('.swiper-pagination span').removeClass('active').eq(index).addClass('active');
        },
        // 反向动画逻辑
        doPlay2: function() {
            var boxClass = this.swipeClass;
            var stepLong = this.stepLong;
            var left = Math.abs(Math.ceil($(boxClass).css('marginLeft').replace('px', '') * 1));
            var allLong = stepLong * this.slides.length;
            var that = this;
            if (left <= 0) {
                $(boxClass).css({ 'marginLeft': -(this.slides.length + this.slidePreview + 1) * this.stepLong })
            }
            left = $(boxClass).css('marginLeft').replace('px', '') * 1;
            //that.stopAutoplay();
            $(boxClass).animate({
                'marginLeft': left + stepLong
            }, that.speed, function() {
                that.activeIndex--;
                if (that.activeIndex < 0) {
                    that.activeIndex = that.slides.length - 1;
                }
                that.activeTips(that.activeIndex);
                that.isAnimating = false;
            })
        },
        startAutoplay: function() {
            if (this.timer) {
                clearInterval(this.timer)
            }
            var that = this;
            that.isAnimating = true;
            var autoplay = this.autoplay;
            this.timer = setInterval(function() {
                that.doPlay();
                that.isAnimating = false;
            }, autoplay)
        },
        /*
         * 滚动到下一张图片；
         * */
        slideNext: function() {
            if (this.isAnimating) {
                return;
            }
            this.stopAutoplay();
            this.doPlay();
            this.startAutoplay();
        },
        /*
         *滚动到上一张图片
         * */
        slidePrev: function() {
            if (this.isAnimating) {
                return;
            }
            this.stopAutoplay();
            this.doPlay2();
            this.startAutoplay();

        },
        /*
         * 更新小按钮的数目
         * */
        refreshTips: function() {
            var slides = this.slides.length;
            var boxClass = this.swipeClass;
            var html = '';
            for (var i = 0; i < slides; i++) {
                console.log(i);
                if (i == 0) {
                    html += '<span class="active">' + (i + 1) + '</span>';
                } else {
                    html += '<span></span>';
                }
            }
            $(boxClass).parent().find('.swiper-pagination').html('').append(html);
        },
        /*
         * 更新小按钮的数目,以及添加数字
         * */
        refreshTipsAndNum: function() {
            var slides = this.slides.length;
            var boxClass = this.swipeClass;
            var html = '';
            for (var i = 0; i < slides; i++) {
                if (i == 0) {
                    html += '<span class="active">' + (i + 1) + '</span>';
                } else {
                    html += '<span>' + (i + 1) + '</span>';
                }
            }
            $(boxClass).parent().find('.swiper-pagination').html('').append(html);
        },
        /*
         * 为小按钮添加事件
         * */
        addSlideTo: function() {
            var boxClass = this.swipeClass;
            var that = this;
            that.stopAutoplay();
            var tips = $(boxClass).parent().find('.swiper-pagination span');
            tips.off('click').on('click', function() {
                var index = $(this).index();
                that.slideTo(index);
                that.activeTips(index);
                that.activeIndex = index;
            })
        },
        /*
         * 跳到指定的slide
         * */
        slideTo: function(index) {
            var that = this;
            that.stopAutoplay();
            var boxClass = this.swipeClass;
            var left = $(boxClass).find('.swiper-slide.default').eq(index).position().left;
            console.log(left);
            $(boxClass).animate({
                'marginLeft': -left
            }, this.speed, function() {
                that.startAutoplay();
            })
        },
        /*
         * 为slidebox添加slide
         * */
        appendSlide: function(slideCon) {
            var boxClass = this.swipeClass;
            $(boxClass).find('.swiper-slide').remove();
            $(boxClass).append(slideCon);
            this.init();
        }
    };
    w.Swiper = Swiper
})(window, jQuery);
$(function() {
    var a = new Swiper({
        className: '.swiper-wrapper',
        autoplay: 2000,
        slidePreview: 2,
        spaceBetween: 10,
        speed: 200
    });
    a.init();
    $('body').on('click', function() {
        //a.startAutoplay();
    });
    $("#next").on('click', function() {
        a.slideNext();
    });
    $("#prev").on('click', function() {
        a.slidePrev();
    })
    $("#setPreview").on('blur', function() {
        a.setPreview($(this).val());
    })



    $("#speed").on('blur', function() {
        a.setSpeed($(this).val())
    })
    $("#setWidth").on('blur', function() {
        $(".swiper-container").css('width', $(this).val() * 1)
        a.setWidth($(this).val())
    })
    $("#add").on('click', function() {
        var html = '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>' +
            '<div name="丛林之珠" class="swiper-slide">' +
            '<img src=http://127.0.0.1:8888/tpl/component/2016/9/11/5f722934da2f476fb398c5936211af84/images/1.jpg alt="">' +
            '</div>';
        a.appendSlide(html)
    })
});
