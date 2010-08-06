
Twitter = function() {
    this.baseurl = "http://api.twitter.com/1/";

    this.lookup = function(screen_name, callback) {
        $.ajax( { 
                    type: "GET",
                    url: this.baseurl + "users/show.json?screen_name=" + screen_name,
                    dataType: "jsonp",
                    cache: false,
                    success: callback});
    };
};

$(document).ready(function(){
                      
                      $('#lookup').keypress(function(event) {
                                                if(event.keyCode == 13){
                                                    log("fetching user '" + this.lastElementChild.value + "'...");
                                                    twit = new Twitter();
                                                    twit.lookup( this.lastElementChild.value, handle_found_user);
                                                    
                                                    return false;
                                                }
                                          });
                      
                  });

function log(message){
    $("#log").append(message + "\n");
}

function handle_found_user(data) {
    log("screen_name:" + data.screen_name + "\nid:" + data.id);
    add_to_graph(data);
};

function add_to_graph(data){
    init(data);
}

$(document).ready(function(){
                      network = new $jit.ForceDirected({
                                                           injectInto: 'network',
                                                           width: "800",
                                                           height: "600",                        
                                                           Navigation: {
                                                               enable: true,
                                                               panning: 'avoid nodes',
                                                               zooming: 10 //zoom speed. higher is more sensible
                                                           },
                                                           // Change node and edge styles such as
                                                           // color and width.
                                                           // These properties are also set per node
                                                           // with dollar prefixed data-properties in the
                                                           // JSON structure.
                                                           Node: {
                                            overridable: true,
                                            style: "circle",
                                            dim: 8,
                                            color: "#9ca6bd",
                                        },
                                        Edge: {
                                            overridable: true,
                                            color: '#23A4FF',
                                            lineWidth: 0.4
                                        },
                                        //Native canvas text styling
                                        Label: {
                                            type: 'Native', //Native or HTML
                                            size: 10,
                                            style: 'bold',
                                            color: "#333333",
                                        },
                                        //Add Tips
                                        Tips: {
                                            enable: true,
                                            onShow: function(tip, node) {
                                                //count connections
                                                var count = 0;
                                                node.eachAdjacency(function() { count++; });
                                                //display node info in tooltip
                                                tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
                                                    + "<div class=\"tip-text\"><b>followers:</b> " + node.data.followers + 
                                                    "<br/><b>friends:</b> " + node.data.friends + "</div>";
                                            }
                                        },
                                        // Add node events
                                        Events: {
                                            enable: true,
                                            //Change cursor style when hovering a node
                                            onMouseEnter: function() {
                                                network.canvas.getElement().style.cursor = 'move';
                                            },
                                            onMouseLeave: function() {
                                                network.canvas.getElement().style.cursor = '';
                                            },
                                            //Update node positions when dragged
                                            onDragMove: function(node, eventInfo, e) {
                                                var pos = eventInfo.getPos();
                                                node.pos.setc(pos.x, pos.y);
                                                network.plot();
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
                                        },
                                        //Number of iterations for the FD algorithm
                                        iterations: 200,
                                        //Edge length
                                        levelDistance: 130,
                                        // Add text to the labels. This method is only triggered
                                        // on label creation and only for DOM labels (not native canvas ones).
                                        onCreateLabel: function(domElement, node){
                                            domElement.innerHTML = node.name;
                                            var style = domElement.style;
                                            style.fontSize = "0.8em";
                                            style.color = "#3333333";
                                        },
                                        // Change node styles when DOM labels are placed
                                        // or moved.
                                        onPlaceLabel: function(domElement, node){
                                            var style = domElement.style;
                                            var left = parseInt(style.left);
                                            var top = parseInt(style.top);
                                            var w = domElement.offsetWidth;
                                            style.left = (left - w / 2) + 'px';
                                            style.top = (top + 10) + 'px';
                                            style.display = '';
                                        }
                                    });
                      
                  });



$(document).ready(function(){
                      $('#log').ajaxError(
                          function(event, request, options, error){
                              this.append('Ajax error: ' + error);
                              alert("error:" + error);   
                          }
                      );
});


function init(data){
    // init data
    var json = [
        {
            "id": data.id,
            "name": data.name,
            data: {
                "followers": data.followers_count,
                "friends": data.friends_count,  
            }
        },
    ];
    
    network.loadJSON(json);
    // compute positions incrementally and animate.
    network.computeIncremental({
                                   iter: 40,
                                   property: 'end',
                                   onStep: function(perc){
                                       log(perc + '% loaded...');
                                   },
                                   onComplete: function(){
                                       log('done');
                                       network.animate({
                                                           modes: ['linear'],
                                                           transition: $jit.Trans.Elastic.easeOut,
                                                           duration: 2500
                                                       });
                                   }
                               });
}
