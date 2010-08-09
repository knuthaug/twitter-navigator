
var Twitter = function(spec) {

    var that = spec;
    this.baseurl = "http://api.twitter.com/1/";

    that.lookup = function(screen_name, callback) {
        return get_request("users/show", screen_name, callback);
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
        
    }

    return that;
};



var Network = function(spec){

    var that = spec;

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
            color: "#9ca6bd",
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
            color: "#333333",
        };
    };

    that.tips_config = function(){
        return {
            enable: true,
            onShow: function(tip, node) {
                tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
                    + "<div class=\"tip-text\"><b>followers:</b> " + node.data.followers + 
                    "<br/><b>friends:</b> " + node.data.friends + "</div>";
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
                var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
                list = [];
                node.eachAdjacency(function(adj){
                                       list.push(adj.nodeTo.name);
                                   });
                //append connections information
                $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
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
                                              onPlaceLabel: that.place_label_handler(),
                                          });
 
    that.log = function (message){
        $("#log").append(message + "\n");
    };

    that.handle_found_user = function(data) {
        that.log("screen_name:" + data.screen_name + "\nid:" + data.id);
        node = {
            "id": data.id,
            "name": data.name,
            "data": {
                "followers": data.followers_count,
                "friends": data.friends_count,  
            }
        };
        
        that.add_to_graph([node]);    
        twit = Twitter({});
        that.log("fetching friends...");
        twit.get_friends(data.screen_name, that.add_friends);
    };

    that.add_friends = function(data){
        nodes = data.map( function(element){
                              //if(element.following == true){
                              return {
                                  id: element.id, 
                                  name: element.name,
                                  data: {
                                      followers: element.followers_count,
                                      friends: element.friends_count,
                                  },
                                  adjacencies: [
                                      {
                                          "nodeTo": node.id, 
                                          "nodeFrom": element.id,
                                      }
                                  ],
                              };
                              //}
                          });
        nodes.unshift(node);
        that.add_to_graph(nodes);

    };

    that.add_to_graph = function(nodes){
        var json = [
            {
                adjacencies: [
                    {
                        "nodeTo": "graphnode0",
                        "nodeFrom": "graphnode1",
                    }, 
                ],
                "id": "graphnode1",
                "name": "graphnode1"
            }, 
            {
                "id": "graphnode0",
                "name": "graphnode0"
            }, ];
        
        
        that.network.loadJSON(nodes);
        // compute positions incrementally and animate.
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
   
}




$(document).ready(function(){
                      network = Network({});
                      $('#lookup').keypress(function(event) {
                                                if(event.keyCode == 13){
                                                    network.log("fetching user '" + this.lastElementChild.value + "'...");
                                                    twit = Twitter({});
                                                    twit.lookup( this.lastElementChild.value, network.handle_found_user);
                                                    
                                                    return false;
                                                }
                                          });
                      
                  });



$(document).ready(function(){
                      
                  });



$(document).ready(function(){
                      $('#log').ajaxError(
                          function(event, request, options, error){
                              this.append('Ajax error: ' + error);
                              alert("error:" + error);   
                          }
                      );
});

