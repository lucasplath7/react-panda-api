import axios from 'axios';
import parser from 'xml2json';
import textExtractors from './textExtractors';

const NEWS_SOURCES = [
  {
    name: 'ALTERNET',
    leans: 'FAR-LEFT',
    rss: 'https://www.alternet.org/feeds/feed.rss',
    customParsing: true,
    extractText: textExtractors.alternetArticleExtract,
  },
  {
    name: 'DAILY-KOS',
    leans: 'FAR-LEFT',
    rss: 'http://feeds.dailykos.com/dailykos/index.xml',
    extractText: textExtractors.defaultArticleExtract,
  },
  {
    name: 'HUFFPOST',
    leans: 'FAR-LEFT',
    rss: 'https://www.huffpost.com/section/politics/feed',
    extractText: textExtractors.defaultArticleExtract,
  },
  {
    name: 'RED-STATE',
    leans: 'FAR-RIGHT',
    rss: 'https://www.redstate.com/feed/',
    extractText: textExtractors.defaultArticleExtract,
  },
  {
    name: 'FOX-NEWS',
    leans: 'FAR-RIGHT',
    rss: 'https://moxie.foxnews.com/google-publisher/politics.xml',
    customParsing: true,
    extractText: textExtractors.foxArticleExtract,
  },
  {
    name: 'NEWS-MAX',
    leans: 'FAR-RIGHT',
    rss: 'https://www.newsmax.com/rss/Politics/1/',
    customParsing: true,
    extractText: textExtractors.newsMaxArticleExtract,
  },
  {
    name: 'NPR',
    leans: 'LEGIT',
    rss: 'https://feeds.npr.org/1001/rss.xml',
    extractText: textExtractors.defaultArticleExtract,
  },
  // {
  //   // ACCESS BLOCKED FOR REAL ARTICLES
  //   name: 'REUTERS',
  //   leans: 'LEGIT',
  //   rss: 'https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best',
  //   customParsing: true,
  //   extractText: textExtractors.reutersArticleExtract,
  // },
  {
    name: 'THE ECONOMIST',
    leans: 'LEGIT',
    rss: 'https://www.economist.com/united-states/rss.xml',
    customParsing: true,
    extractText: textExtractors.economistArticleExtract,
  }
];
const MAX_ARTICLES_PER_SOURCE = 3;

async function getFeeds() {
    function getFulfilledValues(array) {
      return array.reduce((acc, item) => {
        if (item.status === 'fulfilled'){
          return [...acc, item.value];
        }
        return acc;
      }, []);
    }

    const articles = await Promise.allSettled(NEWS_SOURCES.map(async (source) => {
      const rssData = await axios.get(source.rss);
      const parsed = JSON.parse(parser.toJson(rssData.data));
      const rssItems = parsed.rss.channel.item;

      const rssArticles = rssItems.map(item => {
        return {
          title: item.title,
          description: item.description,
          link: item.link || item.guid['$t'],
        }
      });

      const articles = await Promise.allSettled(rssArticles.slice(0, MAX_ARTICLES_PER_SOURCE).map(async (article) => {
          const linkResponse = await axios.get(article.link);
          const articleContent = source.extractText(linkResponse)
            .replaceAll('&#8220;', '"')
            .replaceAll('&#8221;', '"')
            .replaceAll('&#8217;', "'")
            .replaceAll('&quot;', '"')
            .replaceAll('&#39;', "'")
            .replaceAll('&nbsp;', '')
            .replaceAll('.,', '. ')
            .replace(/<source(.*?)\/>/g, '')
            .replace(/<figure(.*?)>/g, '');

          article.sourceName = source.name;
          article.leans = source.leans;
          article.article = articleContent;

          return article;
      }));

      return getFulfilledValues(articles);
    }));

    return getFulfilledValues(articles);
}

module.exports = {
  getFeeds,
}