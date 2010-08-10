var Node = function(spec){

    var that = spec;
    that.node_url = "";
    that.node_id = "";
    that.neo = NeoStore({"network": that.network});

    that.save_master = function(){
        if(! that.neo.node_exists(that).status){
            var status = that.neo.save_node(that);
            that.update(status);
            that.neo.index_node(that);
        }
    };

    that.save = function(to_node){
        var status = "";
        if(to_node && !that.neo.node_exists(that).status){
            status = that.neo.save_node(that);
            that.update(status);
            that.neo.add_connection(that, to_node);
        }
        else {
            if(!that.neo.node_exists(that).status){
                status = that.neo.save_node(that);
                that.update(status);
            }
        }

        if(status){
            that.neo.index_node(that);
        }
    };

    that.update = function(status){
        var response = $.evalJSON(status.responseText);
        that.node_url = response.self;
        that.node_id = response.self.split("/").pop();
    };

    return that;

};


