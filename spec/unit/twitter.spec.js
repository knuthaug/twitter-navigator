describe 'twitter'

  before_each
    network = {}
    neo = {}
    stub(network, 'log').and_return( { } )
    stub(neo, 'node_exists').and_return( { status: true,
                                           "data": {self:"http://localhost:9999/node/1"} })
    stub(neo, 'get_node').and_return( {id: 123} )
    twitter = Twitter({"network": network, "neo": neo})
    data = { }
    $ = { };
    stub($, 'ajax').and_return(true);
  end

  describe 'user lookup'

    it 'should call callback on fetch for valid user'
      stub(neo, 'get_node').and_return( {id: 123} )

      twitter.lookup("knuthaug", function(in_data){
                   data = in_data;
               });
      data.id.should.eql 123
    end

    it 'should call callback with empty data on fetch for invalid user'
      stub(neo, 'node_exists').and_return( { status: false} )
      stub(neo, 'get_node').and_return( {} )
      mock_request().and_return('{ }',
                                 'application/json',
                                 200,
                                 { Accept: 'application/json' })


      twitter.lookup("fooooo", function(in_data){
                   data = in_data;
               });

      data.should.not.have_property 'id'
    end
  end

  describe 'get friends'

    it 'should call callback with data when fetching friends'
       twitter.get_request = function(url, name, callback){
          callback.call(twitter, [{ id: 1}, { id: 2}]);
       };
       twitter.get_friends("knuthaug", function(in_data){
                            data = in_data;
                          });

      data.should.have_length 2
    end

  end

  describe 'get followers'

    it 'should call callback with data when fetching friends'
       twitter.get_request = function(url, name, callback){
          callback.call(twitter, [{ id: 1}, { id: 2}]);
       };
       twitter.get_followers("knuthaug", function(in_data){
                            data = in_data;
                          });

      data.should.have_length 2
    end

  end



end
