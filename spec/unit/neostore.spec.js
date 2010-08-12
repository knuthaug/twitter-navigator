describe 'neostore'

  before
    $ = { };
  end

  before_each
    neo = NeoStore({ })
    stub($, 'toJSON').and_return({ })
    stub($, 'evalJSON').and_return({ })
    stub($, 'ajax').and_return({ "self":"http://localhost:9999/node/123", "data": {id: 123}})
  end

  describe 'save_node()'

    it 'will return json response when saving a node'
      node = Node({ data: { id: 123} })
      result = neo.save_node(node)

      result.self.should.eql "http://localhost:9999/node/123"
      result.data.id.should.eql 123
    end

  end

  describe 'node_exists()'

    it 'returns true if node exists in neo backend'
      result = neo.node_exists( Node( { id: 123, screen_name: "foo" }) )
      result.status.should.eql true
    end

    it 'returns false if node exists in neo backend'
       stub($, 'ajax').and_return({ responseText: "[ ]"})
       result = neo.node_exists( Node( { id: 123, screen_name: "foo" }) )
      result.status.should.eql false
    end

  end

end
