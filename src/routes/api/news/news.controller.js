import axios from 'axios';
import parser from 'xml2json';
import textExtractors from './textExtractors';
import { parse as htmlParse }  from 'node-html-parser';

const NEWS_SOURCES = [
  // {
  //   // WORKS
  //   name: 'ALTERNET',
  //   leans: 'FAR-LEFT',
  //   rss: 'https://www.alternet.org/feeds/feed.rss',
  //   customParsing: true,
  //   extractText: textExtractors.alternetArticleExtract,
  // },
  // {
  //   // FIXED
  //   name: 'DAILY-KOS',
  //   leans: 'FAR-LEFT',
  //   rss: 'http://feeds.dailykos.com/dailykos/index.xml',
  //   extractText: textExtractors.defaultArticleExtract,
  // },
  {
    // WORKS
    name: 'HUFFPOST',
    leans: 'FAR-LEFT',
    rss: 'https://www.huffpost.com/section/politics/feed',
    extractText: textExtractors.defaultArticleExtract,
  },
  // {
  //   // WORKS
  //   name: 'RED-STATE',
  //   leans: 'FAR-RIGHT',
  //   rss: 'https://www.redstate.com/feed/',
  //   extractText: textExtractors.defaultArticleExtract,
  // },
  {
    // WORKS
    name: 'FOX-NEWS',
    leans: 'FAR-RIGHT',
    rss: 'https://moxie.foxnews.com/google-publisher/politics.xml',
    customParsing: true,
    extractText: textExtractors.foxArticleExtract,
  },
  // {
  //   // WORKS
  //   name: 'NEWS-MAX',
  //   leans: 'FAR-RIGHT',
  //   rss: 'https://www.newsmax.com/rss/Politics/1/',
  //   customParsing: true,
  //   extractText: textExtractors.newsMaxArticleExtract,
  // },
  {
    // FIXED
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
  // {
  //   // FIXED
  //   name: 'THE ECONOMIST',
  //   leans: 'LEGIT',
  //   rss: 'https://www.economist.com/united-states/rss.xml',
  //   customParsing: true,
  //   extractText: textExtractors.economistArticleExtract,
  // }
];
const MAX_ARTICLES_PER_SOURCE = 1;

async function getTest() {
  const results = await Promise.all(NEWS_SOURCES.map(async (source) => {
    try {
      await axios.get(source.rss);
      return {name: source.name, success: true}
    } catch (e) {
      console.log('ERROR: ', e)
      return {name: source.name, success: false, error: e}
    }
  }))
  // const rssData = await axios.get('https://www.npr.org/rss/rss.php?id=1001');
  // const parsed = JSON.parse(parser.toJson(rssData.data));
  return results;
}

async function getFeeds() {
    return Promise.all(NEWS_SOURCES.map(async (source) => { 
      let rssData;
      try {
        rssData = await axios.get(source.rss)
        // console.log('SUCCESS rssData: ', rssData.data)
      } catch (err) {
        console.log('error: ', err.message);
        console.log('error source: ', source)
        throw new Error(err);
      }
      
      const parsed = JSON.parse(parser.toJson(rssData.data));
      const rssItems = parsed.rss.channel.item;

      const rssArticles = rssItems.map(item => {429695

        return {
          title: item.title,
          description: item.description,
          link: item.link || item.guid['$t'],
        }
      });

      const articles = await Promise.all(rssArticles.slice(0, MAX_ARTICLES_PER_SOURCE).map(async (article) => {
        let linkResponse
        
        try {
          linkResponse = await axios.get(article.link);
          // console.log('linkResponse: ', linkResponse)
        } catch (err) {
          console.log('err: ', err, Object.keys.err);
          throw new Error(err);
        }
        // console.log('Link Response: ', linkResponse.data)
        
        if (!linkResponse) return;

        if (source.name === 'REUTERS') {
          const parsedHtml = htmlParse(linkResponse.data);
          let trueLink = '';
          try {
            function findSourceLink(childObj) {
              if (childObj.parentNode.rawAttrs.includes('href') && !trueLink) {
                const hrefText = childObj.parentNode.rawAttrs;
                trueLink = hrefText.slice(hrefText.indexOf('"') + 1, hrefText.lastIndexOf('"'));
              }
              if (childObj.childNodes && childObj.childNodes.length > 0) {
                childObj.childNodes.forEach(childNode => findSourceLink(childNode));
              }
            }

            function findSourceContent(obj) {
              if (obj.rawAttrs && obj.rawAttrs.includes('et_pb_post_content')) {
                obj.childNodes.forEach(childNode => findSourceLink(childNode));
              }
              if (obj.childNodes && obj.childNodes.length > 0) {
                obj.childNodes.forEach(n=> {
                  findSourceContent(n);
                })
              }
            }
            findSourceContent(parsedHtml);
            console.log('true link: ', trueLink)
            article.link = trueLink;
            linkResponse = await axios.get(trueLink);
          } catch (e) {
            console.log('failed for link: ', trueLink);
          }
        }
        try {
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
          // console.log('\n\n\narticle content: ', articleContent)
          article.sourceName = source.name;
          article.leans = source.leans;
          article.article = articleContent;
          // console.log('artivle obj: ', article)
          return article;
        } catch (e) {
          console.log('Final string replacement failed for : ', article)
        }
      }));

      return articles.filter(i => !!i);
    }));
}

module.exports = {
  getFeeds,
  getTest
}