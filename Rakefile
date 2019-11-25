desc "Transform Planet.rb style post extensions to Middleman-Blog supported extensions"
task :transform_planet_exts do
    ARTICLE_DIR = "source/articles"
    PRIMARY_EXT = ".markdown"
    SUB_EXT = ".html"
    POST_EXTENSION = ".html.markdown"

    Dir.glob("#{ARTICLE_DIR}/*#{PRIMARY_EXT}").each do |post| 
        post_name = File.basename(post, PRIMARY_EXT)
        next if post_name.end_with?(SUB_EXT)
        File.rename(post, Pathname(post).sub_ext(POST_EXTENSION).to_s)
    end        
end