import axios from 'axios';
import parser from 'xml2json';

const NEWS_SOURCES = [
  {
    name: 'HUFFPOST',
    leans: 'FAR-LEFT',
    rss: 'https://www.huffpost.com/section/politics/feed'
  },
  {
    name: 'RED-STATE',
    leans: 'FAR-RIGHT',
    rss: 'https://www.redstate.com/feed/'
  },
  {
    name: 'NPR',
    leans: 'LEGIT',
    rss: 'https://www.npr.org/rss/rss.php?id=1001'
  }
]

async function getFeeds() {
  try {
    let consolidatedFeeds = [];
    for(let source of NEWS_SOURCES) {
      const rssData = await axios.get(source.rss)
      const parsed = JSON.parse(parser.toJson(rssData.data));

      const rssArticles = parsed.rss.channel.item.map(item => {
        return {
          title: item.title,
          description: item.description,
          link: item.link,
        }
      });
  
      // let sourceContent = [];
      let count = 0;
      for(let article of rssArticles) {
        if (count < 5) {
          let linkResponse
          try {
            linkResponse = await axios.get(article.link);
          } catch (err) {
            console.log(Object.keys.err);
          }
          if (!linkResponse) continue;
          const regex = /<p>(.*)<\/p>/g
          linkResponse = linkResponse.data.match(regex).join()
            .replace(/<a(.*?)>/g, '')
            .replace(/<\/a>/g, '')
            .replace(/<blockquote(.*?)>/g, '')
            .replace(/<\/blockquote>/g, '')
            .replace(/<script(.*?)\/script>/g, '')
            .replace(/<i(.*?)\/i>/g, '')
            .replace(/<div(.*?)>/g, '')
            .replace(/<\/div>/g, '')
            .replace(/<span(.*?)>/g, '')
            .replace(/<\/span>/g, '')
            .replace(/<p(.*?)>/g, '')
            .replace(/<\/p>/g, '')
            .replace(/<em(.*?)>/g, '')
            .replace(/<\/em>/g, '')
            .replace(/<strong(.*?)>/g, '')
            .replace(/<\/strong>/g, '')
            .replace('.,', '. ')
            .replace(/<img(.*)>/g, '');
          
          article.sourceName = source.name;
          article.leans = source.leans;
          article.article = linkResponse;

          consolidatedFeeds.push(article);
        }
        count++;
      }
    }
  
    return consolidatedFeeds;
  } catch (err) {
    console.log(Object.keys(err.response));
  }
}

module.exports = {
  getFeeds,
}