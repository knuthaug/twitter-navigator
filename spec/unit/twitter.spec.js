describe 'twitter'

  before_each
    network = {};
    neo = {};
    stub(network, 'log').and_return( { } );
    twitter = Twitter({"network": network, "neo": neo})
    $ = {};
  end

  describe 'fetch_user'
    it 'should call callback on fetch'
      var called = 0;
      stub(neo, 'node_exists').and_return( { status: true} );
      stub(twitter, 'get_request').and_return( { } );
      stub($, 'ajax').and_return( { } );
      stub($, 'evalJSON').and_return( { } );
      var user = twitter.lookup("foo", function(){
                                called++;
                      });
      twitter.should.receive('get_request', 'once');
      called.should.eql 1
    end
  end

end
