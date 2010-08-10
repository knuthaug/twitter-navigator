
$(document).ready(function(){
                      network = Network({});
                      $('#lookup').keypress(function(event) {
                                                if(event.keyCode == 13){
                                                    twit = Twitter({"network": network});
                                                    twit.lookup( this.lastElementChild.value, network.handle_found_user);
                                                    
                                                    return false;
                                                }
                                            });
                      
                  });


$(document).ready(function(){
                      $('#log').ajaxError(
                          function(event, request, options, error){
                              $('#log').append('Ajax error: ' + error + request.data);
                          }
                      );
});

