
load('/Users/knuthaug/.rvm/gems/ruby-1.9.2-rc2/gems/jspec-4.3.3/lib/jspec.js')
load('/Users/knuthaug/.rvm/gems/ruby-1.9.2-rc2/gems/jspec-4.3.3/lib/jspec.xhr.js')
load('lib/twitnavi.js')
load('spec/unit/spec.helper.js')

JSpec
.exec('spec/unit/spec.js')
.run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
.report()