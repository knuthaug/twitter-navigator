var NeoStore = function(spec){
    
    var that = spec;

    that.baseurl = "http://localhost:9999/";
    that.request_url = "http://localhost/neo4j/";

    that.save_node = function(node){
        return that.post_request(this.request_url + 'node', $.toJSON({
                                                                         id: node.id,
                                                                         name: node.name, 
                                                                         screen_name: node.screen_name,
                                                                         followers: node.data.followers,
                                                                         friends: node.data.friends
                                                                     }));
    };

    that.index_node = function(node){
        that.post_request(this.request_url + 'index/node/id/' + node.id, this.baseurl + 'node/' + node.node_id);
        that.post_request(this.request_url + 'index/node/screen_name/' + node.screen_name, this.baseurl + 'node/' + node.node_id);
    };

    that.node_exists = function(node){
        var data = that.get_request(this.request_url + 'index/node/screen_name/' + node.screen_name);

        if(data.responseText == "[ ]"){
            return { status: false, "data": $.evalJSON(data.responseText)[0]};            
        }
        else {
            return { status: true, "data": $.evalJSON(data.responseText)[0]};
        }
            
    };

    that.get_node = function(node_id){
        var node = $.evalJSON(that.get_request(this.request_url + 'node/' + node_id + "/properties").responseText);
        node.follows = $.evalJSON(that.get_request(this.request_url + 'node/' + node_id + "/relationships/out/follows").responseText);
        return node;
    };

    that.add_connection = function(node, to_node, callback){
        
        //that.network.log('node_id='+ node.node_id + "/" + to_node.node_url);
        return that.post_request(this.request_url + 'node/' + to_node.node_id + "/" + "relationships", 
                                 $.toJSON({to: node.node_url, type: "follows"}), callback);
    };

    that.post_request = function(url, json, callback){

        return $.ajax( { 
                           type: "POST",
                           url: url,
                           dataType: "json",
                           contentType: 'application/json',
                           data: json,
                           processData: false,
                           async: false,
                           cache: false
                           });
        
    };


    that.get_request = function(url, json){

        return $.ajax( { 
                           type: "GET",
                           url: url,
                           dataType: "json",
                           contentType: 'application/json',
                           data: json,
                           async: false, 
                           processData: false, 
                           cache: false
                           });
        
    };

    return that;

};

