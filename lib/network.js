var Network = function(spec){

    var that = spec;
    that.neo = NeoStore({});
    that.master_node = { };
 
    that.navigation_options = function(){
        return {
            enable: true,
            panning: 'avoid nodes',
            zooming: 10 //zoom speed. higher is more sensible
        };
    };

    that.node_options = function(){
        return {
            overridable: true,
            style: "circle",
            dim: 8,
            color: "#9ca6bd"
        };
    };
        
    that.edge_options = function(){
        return {
            overridable: true,
            color: '#23A4FF',
            lineWidth: 0.4
        };
    };

    that.label_options = function(){
        return {
            type: 'Native', //Native or HTML
            size: 10,
            style: 'bold',
            color: "#333333"
        };
    };

    that.tips_config = function(){
        return {
            enable: true,
            onShow: function(tip, node) {
                tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>" + "<div class=\"tip-text\"><b>followers:</b> " + node.data.followers + "<br/><b>friends:</b> " + node.data.friends + "</div>";
            }
        };
    };
    
    that.event_config = function(){
        return {
            enable: true,
            //Change cursor style when hovering a node
            onMouseEnter: function() {
                that.network.canvas.getElement().style.cursor = 'move';
            },
            onMouseLeave: function() {
                that.network.canvas.getElement().style.cursor = '';
            },
            //Update node positions when dragged
            onDragMove: function(node, eventInfo, e) {
                var pos = eventInfo.getPos();
                node.pos.setc(pos.x, pos.y);
                that.network.plot();
            },
            //Implement the same handler for touchscreens
            onTouchMove: function(node, eventInfo, e) {
                $jit.util.event.stop(e); //stop default touchmove event
                this.onDragMove(node, eventInfo, e);
            },
            //Add also a click handler to nodes
            onClick: function(node) {
                if(!node) return;
                // Build the right column relations list.
                // This is done by traversing the clicked node connections.
            }
            
        };
    };

    that.create_label_handler = function(){
        return function(domElement, node){
            domElement.innerHTML = node.name;
            var style = domElement.style;
            style.fontSize = "0.8em";
            style.color = "#3333333";
        };
    };

    that.place_label_handler = function(){
        return function(domElement, node){
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
            style.top = (top + 10) + 'px';
            style.display = '';
        };
    };

    that.network = new $jit.ForceDirected({
                                              injectInto: 'network',
                                              width: "800",
                                              height: "600",                        
                                              Navigation: that.navigation_options(),
                                              Node: that.node_options(),
                                              Edge: that.edge_options(),
                                              //Native canvas text styling
                                              Label: that.label_options(),
                                              Tips: that.tips_config(),
                                              Events: that.event_config(),             
                                              //Number of iterations for the FD algorithm
                                              iterations: 200,
                                              levelDistance: 200,
                                              onCreateLabel: that.create_label_handler(),
                                              onPlaceLabel: that.place_label_handler()
                                          });
 
    that.log = function (message){
        $("#log").append(message + "\n");
    };

    that.handle_found_user = function(data) {
        that.log("screen_name:" + data.screen_name + "\nid:" + data.id);
        that.master_node = Node({
                                    "id": data.id,
                                    "name": data.name,
                                    "screen_name": data.screen_name,
                                    "data": {
                                        "followers": data.followers_count || data.followers,
                                        "friends": data.friends_count || data.friends
                                    }
                                });
        
        that.initialize_graph(that.master_node);

        if(data.follows){
            that.log("fetching friends from neo...");

            data.follows.forEach(function(element, index){
                                     var node = that.neo.get_node(element.end.split("/").pop());
                                     node.data = {                                              
                                         followers: node.followers,
                                         friends: node.friends
                                     };

                                     that.network.graph.addNode(node);
                                     that.network.graph.addAdjacence(node, that.master_node);

                                 });
        }
        else {
            twit = Twitter({"network": that});
            that.log("fetching friends...");
            twit.get_friends(data.screen_name, that.add_friends);
        }

        that.compute_layout();

    };

    that.add_friends = function(data){
        data.map( function(element){
                      //if(element.following == true){
                      var node = Node({
                                          id: element.id, 
                                          name: element.name,
                                          screen_name: element.screen_name,
                                          data: {
                                              followers: element.followers_count,
                                              friends: element.friends_count
                                          }
                                      });
                      //}
                      that.add_to_graph(node, that.master_node);
                  });
        that.compute_layout();
    };

    that.initialize_graph = function(node){
        that.network.loadJSON([node]);
        node.save_master();
        //that.compute_layout();
    };

    that.add_to_graph = function(node, to_node){
        that.network.graph.addNode(node);
        node.save(to_node);
        that.network.graph.addAdjacence(node, to_node);
    };

    that.compute_layout = function(){
        that.network.computeIncremental({
                                            iter: 20,
                                            property: 'end',
                                            onStep: function(perc){
                                                that.log(perc + '% loaded...');
                                            },
                                            onComplete: function(){
                                                that.log('done');
                                                that.network.plot();
                                                that.network.animate({
                                                                         modes: ['linear'],
                                                                         transition: $jit.Trans.Elastic.easeOut,
                                                                         duration: 2500
                                                                     });
                                            }
                                        });
        };

    return that;

};
       
