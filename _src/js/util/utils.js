/*!
 *
 * App Module: /util
 *
 * @namespace util
 * @memberof app
 *
 *
 */
 import $ from "jquery";
 import Controller from "properjs-controller";
 import ScrollController from "properjs-scrollcontroller";
 import ResizeController from "properjs-resizecontroller";
 import ImageLoader from "properjs-imageloader";
 import debounce from "properjs-debounce";


    // Default DOM handling selectors
  const selectors = {
    resize: ".js-resize",
    lazyImg: ".js-lazy-image"
  },

  $_jsHtml = $( ".js-html" ),
  $_jsHeader = $( ".js-header" ),

  _jsHeaderHeight = $_jsHeader.outerHeight( true ),

  mathMin = Math.min,
  mathAbs = Math.abs,

/**
 *
 * Single app instanceof Controller for arbitrary event emitting
 * @member emitter
 * @memberof util
 *
 */
emitter = new Controller(),


/**
 *
 * Single app instanceof Scroller
 * @member scroller
 * @memberof util
 *
 */
scroller = new ScrollController(),


/**
 *
 * Single app instanceof Resizer
 * @member resizer
 * @memberof util
 *
 */
resizer = new ResizeController(),

/**
 *
 * Get nearest value from an array of numbers given a control number
 * @method closestValue
 * @param {number} num The control Number
 * @param {object} arr The array to check
 * @returns Number
 * @memberof util
 *
 */
closestValue = function ( num, arr ) {
    var curr = arr[ 0 ],
        diff = mathAbs( num - curr );

    for ( var val = arr.length; val--; ) {
        var newdiff = mathAbs( num - arr[ val ] );

        if ( newdiff < diff ) {
            diff = newdiff;
            curr = arr[ val ];
        }
    }

    return curr;
},


closestValueUp = function ( num, arr ) {
    var curr = arr[ 0 ],
        diff = mathAbs( num - curr );

    for ( var val = arr.length; val--; ) {
        var newdiff = mathAbs( num - arr[ val ] );

        if ( arr[ val ] > num && newdiff < diff ) {
            diff = newdiff;
            curr = arr[ val ];
        }
    }

    return curr;
},


/**
 *
 * Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @param {function} callback Optional callback when loaded
 * @memberof util
 *
 */
loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || onImageLoadHandler);

    // Normalize the images
    images = (images || $( selectors.lazyImg ));

    // Get the right size image for the job
    images.each(function () {
        var $img = $( this ),
            data = $img.data(),
            width = mathMin( ($img.width() || $img.parent().width()) ),
            nextSize,
            variant,
            variants;

        if ( data.variants ) {
            variants = data.variants.split( "," );

            for ( var i = variants.length; i--; ) {
                variants[ i ] = parseInt( variants[ i ], 10 );
            }

            variant = closestValue( width, variants );
            nextSize = closestValueUp( variant, variants );

            // Test out the size, maybe we need to bump it up
            // Consequently, Squarespace will not server over 1500w
            // so this may just really be a test in futility.
            if ( variant < width && nextSize ) {
                variant = nextSize;
            }

            $img.attr( "data-img-src", data.imgSrc + "?format=" + variant + "w" );
        }
    });

    return new ImageLoader({
        elements: images,
        property: "data-img-src"

    // Default handle method. Can be overriden.
    }).on( "data", handler );
},


/**
 *
 * Module onImageLoadHander method, handles event
 * @method onImageLoadHandler
 * @param {object} el The DOMElement to check the offset of
 * @returns boolean
 * @memberof util
 *
 */
onImageLoadHandler = function ( elem ) {
    var y = $( elem ).offset().top,
        ret = false;

    if ( y < (scroller.getScrollY() + window.innerHeight) || y < window.innerHeight ) {
        ret = true;
    }

    return ret;
},


/**
 *
 * Module getCollection method, requests next page of collections
 * @method getCollection
 * @memberof collection
 *
 */
getCollection = function ( elem ) {
    $.ajax({
        url: $( elem ).data( "collection" ),
        type: "GET",
        dataType: "text",
        processData: false

    })
    .done(function ( html ) {
        var $page = $( html ),
            $collection = $page.filter( ".js-collection-list" ),
            $tiles;

        $collection = $collection.length ? $collection : $page.find("div.js-collection-list");
        $tiles = $collection.children();

        $( elem ).append( $tiles );
        loadImages();
        emitter.fire( "collectionLoaded" );
    })
    .fail(function (  xhr, status, error  ) {
        console.log( "fail: ", error );
    });
},


/**
 *
 * Resize elements based on keyword
 * @method resizeElements
 * @param {object} elems Optional collection to resize
 * @memberof util
 *
 */
resizeElements = function ( elems ) {
    (elems || $( selectors.resize )).each(function () {
        var $this = $( this ),
            data = $this.data(),
            css = {};

        if ( data.resize === "viewport" ) {

            if ( window.innerHeight > 500 ) {
                css.height = window.innerHeight;
            } else {
                css.height = 500;
            }

        }  else if ( data.resize === "square" ) {
            css.height = $this.width();

        } else if ( data.resize === "square-fit" ) {
            var offset = 0;

            if ( window.innerWidth <= 1024 && window.innerWidth >= 640 ) {
                offset = 110;
            } else if ( window.innerWidth <= 640 ) {
                offset = 60;
            } else {
                offset = ( ( _jsHeaderHeight * 2 ) );
            }

            css = calculateAspectRatioFit(
                mathMin( window.innerHeight - offset, window.innerWidth - offset ),
                mathMin( window.innerHeight - offset, window.innerWidth - offset ),
                mathMin( window.innerHeight - offset, window.innerWidth - offset ),
                mathMin( window.innerHeight - offset, window.innerWidth - offset )
            );
        }

        $this.css( css );
    });
},


/**
 *
 * Set margin top on section content
 * @method contentMargin
 * @memberof util
 *
 */
contentMargin = function () {
    if ( $( ".js-section-collapse" ).length ) {
        var $_jsSectionContent = $( ".js-section-content" ),
            $_jsSectionCollapse = $( ".js-section-collapse" ),
            offsetBottom = $_jsSectionCollapse.outerHeight(true);

        $_jsSectionContent.css( "margin-top", offsetBottom );
    }
},

/**
 *
 * Toggle on/off scrollability
 * @method toggleMouseWheel
 * @param {boolean} enable Flag to enable/disable
 * @memberof util
 *
 */
toggleMouseWheel = function ( enable ) {
    if ( enable ) {
        $_jsHtml.off( "DOMMouseScroll mousewheel" );

    } else {
        $_jsHtml.on( "DOMMouseScroll mousewheel", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 * Resize arbitary width x height region to fit inside another region.
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 * @url: http://opensourcehacker.com/2011/12/01/calculate-aspect-ratio-conserving-resize-for-images-in-javascript/
 * @method calculateAspectRatioFit
 * @memberof util
 * @param {Number} srcWidth Source area width
 * @param {Number} srcHeight Source area height
 * @param {Number} maxWidth Fittable area maximum available width
 * @param {Number} srcWidth Fittable area maximum available height
 * @return {Object} { width, heigth }
 *
 */
calculateAspectRatioFit = function( srcWidth, srcHeight, maxWidth, maxHeight ) {
    var ratio = mathMin( (maxWidth / srcWidth), (maxHeight / srcHeight) );

    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
};


/******************************************************************************
 * Export
*******************************************************************************/
export default { emitter, scroller, resizer, loadImages, toggleMouseWheel, getCollection, onImageLoadHandler, contentMargin, resizeElements, calculateAspectRatioFit };
