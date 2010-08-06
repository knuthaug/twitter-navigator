describe 'twitnavi'
  
  
  describe 'fetch_user'
    it 'should fetch user info from twitter api'
        twitter = new Twitter()
        stub(twitter, 'lookup_user').and_return( {id:"foo" } )
        user = twitter.lookup_user("foo")
        user.should.have_property 'id'    
    end
 end
end
