
require.paths.unshift('spec', '/Users/knuthaug/.rvm/gems/ruby-1.9.2-rc2/gems/jspec-4.3.3/lib', 'lib')
require('jspec')
require('unit/spec.helper')
require('twitnavi')

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
