# Theme configuration
config[:silverback] = {
  blog: {
    # The full URL to your site (used in the RSS feed and sitemap)
    url: 'http://example.com',
    # Your blog's title (used in the title meta and in the header)
    title: 'Nilenso Software Weblog',
    # Your blog's subtitle (used in the description meta and in the header)
    subtitle: 'nilenso is an employee-owned software cooperative',
    # The URL linked to in the header (leave as-is unless your site isn't at the
    # root of your domain)
    home_url: '/',
    # The path to the image you want to use in the header
    avatar_url: '/images/nilenso-200.png',
    # Options for the description in the sidebar
    sidebar_show_description: true,
    sidebar_description_prefix: '<h3>About us</h3>',
    description: '<p>We practice test driven development and continuous delivery, and love working with Clojure and Ruby on Rails.</p>
    <br/>
    <p>
This blog is a showcase of our growth as a consultancy, a product company and generally curious beings. Get in touch with us at hello@nilenso.com.</p>',
    # Options for the articles list in the sidebar
    sidebar_show_articles: true,
    sidebar_articles_prefix: '',
    # Options for the archive links in the sidebar
    sidebar_show_archives: true,
    sidebar_archives_prefix: '',
    # Your name (used in the post meta)
    # author: 'Elliot Jackson',
    # The text you want in the read more buttons
    read_more_text: 'Read more...',
    # The text you want for the pagination links
    pagination_next_text: 'Older posts',
    pagination_prev_text: 'Newer posts',
    # The text you want to show in the footer
    # footer_text: 'This is some sample footer text.'
  }
}

# Specify layouts
page '/*.html', layout: 'layouts/body'
page '/feed.xml', layout: false

# Markdown configuration
set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, footnotes: true, highlight: true,
               link_attributes: { rel: 'nofollow' }, smartypants: true

# Autoprefix the CSS
activate :autoprefixer

# Middleman-blog configuration
activate :blog do |blog|
  blog.sources = 'articles/{year}-{month}-{day}-{title}'
  # blog.layout = 'layout'
  blog.summary_separator = /READMORE/
  # blog.summary_length = 250
  # blog.year_link = '{year}.html'
  # blog.month_link = '{year}/{month}.html'
  # blog.day_link = '{year}/{month}/{day}.html'
  # blog.default_extension = '.markdown'

  blog.calendar_template = 'calendar.html'

  # Enable pagination
  blog.paginate = true
  blog.per_page = 2
  # blog.page_link = 'page/{num}'
end

# Use pretty URLs
activate :directory_indexes

# Middleman-syntax configuration
activate :syntax, line_numbers: true

configure :development do
  activate :livereload
end

configure :build do
  activate :asset_hash
  activate :minify_css
  activate :minify_javascript
end
