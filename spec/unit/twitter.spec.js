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

end
