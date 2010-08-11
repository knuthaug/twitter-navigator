describe 'neostore'

  before
    $ = { };
  end

  before_each
    neo = NeoStore({ })
  end

  describe 'save_node()'

    it 'will return json response when saving a node'
      stub($, 'toJSON').and_return({ })
      stub($, 'ajax').and_return({ "self":"http://localhost:9999/node/123", "data": {id: 123}});

      node = Node({ data: { id: 123} })
      result = neo.save_node(node)

      result.self.should.eql "http://localhost:9999/node/123"
      result.data.id.should.eql 123
    end

  end

end
