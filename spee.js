(function (window) {
    var Spee = {};

    Spee.SpeeCommand = function (match, callback) {
        var match = typeof arguments[0] === "string" ? arguments[0] : undefined;
        var callback = arguments.length === 1 ? arguments[0] : arguments[1];
        
        this.match = match;
        this.callback = callback;
    };
    
    Spee.SpeeCommand.prototype.analyze = function (words) {
        var word = words.shift();
        
        if (typeof this.match === "object") {
            if (!word.match(this.match)) {
                return false;
            }
        } else {
            if (this.match !== word) {
                return false;
            }
        }
        
        this.callback.apply(this, []);
    };
    
    Spee.SpeeRoute = function (match) {
        this.sub = [];
        this.commands = [];
        this.match = match || /.*/;
        this.result = [];
    };
    
    Spee.SpeeRoute.prototype.listen = function () {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        var self = this;

        this.recognition.onresult = function (event) {

            var interim_transcript = '',
                final_transcript = '';

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                console.log(event.results[i]);
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            console.log('FIN: ', final_transcript);
            console.log('INT: ', interim_transcript);

            if (final_transcript.length > 0) {
                var words = final_transcript.trim().toLowerCase().split(' ');
                self.analyzeChildren(words);
            }
            
        };
        
        this.recognition.lang = 'en-US';
        this.recognition.start();
    };
    
    Spee.SpeeRoute.prototype.analyze = function (words) {
        var word = words.shift().trim();
        
        if (typeof this.match === "object") {
            var matches = word.match(this.match);
            if (!matches) {
                return false;
            }
            
            var mi;
            
            for (mi = 0; mi < matches.length; mi ++ ) {
                this.result[mi] = matches[mi];
            }
            for (mi = matches.length; mi < this.result.length; mi ++ ) {
                delete this.result[mi];
            }
            
        } else if (typeof this.match === "string") {
            if (this.match !== word) {
                return false;
            }
            this.result[0] = this.match;
        } else if (typeof this.match === "undefined") {
            this.result[0] = word;
        }
        
        this.analyzeChildren(words);
    };
        
    Spee.SpeeRoute.prototype.analyzeChildren = function (words) {
        for (var i = 0; i < this.sub.length; i ++) {
            var w_clone = words.slice(0);
            var sub = this.sub[i];
            if (sub.analyze(w_clone)) {
                break;
            }
        }
        
        for (var i = 0; i < this.commands.length; i ++) {
            var w_clone = words.slice(0);
            var command = this.commands[i];
            command.analyze(w_clone);
        }
        
        return true;
    };

    Spee.SpeeRoute.prototype.route = function (match, body_callback) {
        var route = new Spee.SpeeRoute(match);
        this.sub.push(route);
        
        if (typeof body_callback !== "undefined") {
            body_callback.apply(route, [route.result]);
        }
        
        return this;
    };

    Spee.SpeeRoute.prototype.command = function () {
        var match = typeof arguments[0] === "string" ? arguments[0] : undefined;
        var callback = arguments.length === 1 ? arguments[0] : arguments[1];
        
        var route = new Spee.SpeeCommand(match, callback);
        this.commands.push(route);
        return this;
    };

    window.spee = new Spee.SpeeRoute();
})(window);