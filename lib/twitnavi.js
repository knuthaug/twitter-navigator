
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
                      
                      $('#lookup').submit(function(event) {
                                              
                                              $("#log").append("fetching user '" + $("#username").value + "'...\n");
                                              twit = new Twitter();
                                              twit.lookup( $('#username').value, function(data){
                                                              $('#log').append("screen_name:" + 
                                                                               data.screen_name + 
                                                                               "\nid:" + data.id);
                                                          });
                                              
                                              return false;
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

