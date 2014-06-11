$(document).ready(function () {

    var spee = window.spee;
    var $div1 = $('<div id="div1" />')
        .appendTo($('body'))
        .width(300)
        .height(100)
        .css('border', '3px solid black')
        .css('padding', '10px')
    ;
    
    spee
    
        .route('hi', function () {
            
            this
                .command('google', function () {
                    $div1.text('Hello from Mountain View!');
                })
                .command('microsoft', function () {
                    $div1.text('Hellow from Redmond!');
                })
            ;
                       
        })
    
        .route('color', function () {
            this
                .route(/red|green|blue/, function (color) {
                    
                    this
                        .command('border', function () {
                            $div1.css('border-color', color[0]);
                        })
                        .command(function () {
                            $div1.css('background-color', color[0]);
                        })
                    ;
                    
                })
            ;
        })
    
        .listen()
        
    ;

});