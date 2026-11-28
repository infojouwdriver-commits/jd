Pod::Spec.new do |s|
  s.name = 'JdCarPlay'
  s.version = '1.0.0'
  s.summary = 'JOUW DRIVER CarPlay navigation'
  s.description = 'Connects the active JOUW DRIVER trip to CarPlay.'
  s.homepage = 'https://jouww.com'
  s.license = { :type => 'MIT' }
  s.author = 'JOUW DRIVER'
  s.source = { :git => 'https://github.com/infojouwdriver-commits/jd.git' }
  s.platform = :ios, '16.4'
  s.swift_version = '5.9'
  s.static_framework = true
  s.source_files = '**/*.swift'
  s.frameworks = 'CarPlay', 'CoreLocation', 'MapKit', 'UIKit'
  s.dependency 'ExpoModulesCore'
end
