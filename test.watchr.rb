if __FILE__ == $0
  puts "Run with: watchr #{__FILE__}. \n\nRequired gems: watchr rev"
  exit 1
end

# --------------------------------------------------
# Convenience Methods
# --------------------------------------------------
def run(cmd)
  system 'clear'
  puts(cmd)
  system cmd
end

def run_all_tests
  run "vows test/*-test.js"
end

def run_single_test *test
  test = test.select { |s| File.exist?(s) }.join(' ')
  run "vows #{test}"
end

# --------------------------------------------------
# Watchr Rules
# --------------------------------------------------
watch( '^test/helper\.js'                    ) {     run_all_tests }
watch( '^test/.*-test\.js'                        ) { |m| run_single_test(m[0]) }
watch( '^lib/(.*)\.js'                            ) { |m| run_single_test("test/%s-test.js" % m[1] ) }


# --------------------------------------------------
# Signal Handling
# --------------------------------------------------
# Ctrl-\
Signal.trap('QUIT') do
  puts " --- Running all tests ---\n\n"
  run_all_tests
end
 
# Ctrl-C
Signal.trap('INT') { abort("\n") }
