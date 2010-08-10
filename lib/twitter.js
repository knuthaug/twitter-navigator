var Twitter = function(spec) {

    var that = spec;
    this.baseurl = "http://api.twitter.com/1/";
    that.neo = NeoStore({});

    that.lookup = function(screen_name, callback) {
        var status = that.neo.node_exists({"screen_name": screen_name}); 
        that.network.log("found in neo:" + status.status);

        if(!status.status){
            that.network.log("fetching from twitter");
            return get_request("users/show", screen_name, callback);
        }
        
        callback.call(that.network, that.neo.get_node(status.data.self.split("/").pop()));
        return true;
    };

    that.get_friends = function(screen_name, callback) {
        return get_request("statuses/friends", screen_name, callback);
    };

    that.get_followers = function(screen_name, callback) {
        return get_request("statuses/followers", screen_name, callback);
    };

    this.get_request = function(url_part, screen_name, callback){
        return $.ajax( { 
                           type: "GET",
                           url: this.baseurl + url_part + ".json?screen_name=" + screen_name,
                           dataType: "jsonp",
                           cache: false,
                           success: callback});
        
    };

    return that;
};


