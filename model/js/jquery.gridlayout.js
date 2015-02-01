// Utility
if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window, document, undefined){

    var GridLayout = {
        /**
         * Initialize content.
         */
        init: function( options, elem ) {
            // --- MEMBER ---
            var self = this;
            self.resizeTimer = null;

            // element
            self.elem  = elem;
            self.$elem = $(elem);
            // item info.
            self.items     = self.$elem.find( self.$elem.children() );
            self.itemWidth = self.$elem.find( self.$elem.children().eq(0) ).outerWidth();

            // extend options.
            self.options = $.extend( {}, $.fn.gridLayout.options, options );

            // --- METHODS ---
            // init.
            self.bindEvents();
            self.updateLayout();
        },
        /**
         * Bind all event.
         */
        bindEvents: function() {
            if ( this.options.isResize ) {
                $(window).on('resize', this.onResize(this));
            }
        },
        /**
         * On container resize.
         */
        onResize: function(self) {
            return function() {
                if ( self.resizeTimer ) {
                    clearTimeout(self.resizeTimer);
                }
                self.resizeTimer = setTimeout(function() {
                    self.updateLayout();
                }, self.options.resizeDelay);
            };
        },
        /**
         * Perform a full layout pdate.
         */
        updateLayout: function() {
            //
            var self          = this,
                itemCount     = this.items.length,
                i             = 0,
                shortest      = 0,
                shortestIndex = 0,
                column        = Math.floor( this.$elem.outerWidth() / (this.itemWidth + this.options.margin) ),
                row           = Math.ceil(itemCount / column),
                leftStart     = (this.$elem.outerWidth() - column * (this.itemWidth + this.options.margin)) / 2,
                heightList    = [],
                posList       = [];

            // var t = new Date();

            while(heightList.length < column) {
                heightList.push(0);
            }


            var itemsCopy = this.items.slice();

            // do the layout.
            for ( i = 0; i < row; i++ ) {

                var items = itemsCopy.splice(0,column),
                    count = items.length;

                for ( var k = 0; k < count; k++ ) {

                    // check if last row.
                    if ( !self.options.inOrder ||  (row - 1) <= i ) {
                        // shortest height.
                        shortest = Math.min.apply(Math, heightList);

                        // get shortest column index.
                        for( var ii = 0; ii < column; ii++) {
                            if ( heightList[ii] === shortest ) {
                                shortestIndex = ii;
                                break;
                            }
                        }
                    }
                    else {
                        shortest = heightList[k];
                        shortestIndex = k;
                    }

                    // Stock position
                    posList.push( { top: shortest, left: leftStart + (this.itemWidth + this.options.margin) * shortestIndex} );

                    // stock height.
                    heightList[shortestIndex] = shortest + $(items[k]).outerHeight() + this.options.margin;
                }
            }

            // update container height.
            this.$elem.height( Math.max.apply(null, heightList) - this.options.margin );

            // move items.
            this.items.css({ position: 'absolute' });

            for (i = 0; i < itemCount; i++) {
                $(this.items[i]).css({
                    top : posList[i].top +'px',
                    left: posList[i].left +'px'
                });
            }

            // $.log( new Date() - t +' msec' );
        }

    };

    $.fn.gridLayout = function( options ) {
        return this.each(function(){
            var gridLayout = Object.create( GridLayout );
            gridLayout.init( options, this );
        });
    };

    $.fn.gridLayout.options = {
        margin      : 2,
        resizeDelay : 100,
        isResize    : true,
        inOrder     : true
    };

})( jQuery, window, document );