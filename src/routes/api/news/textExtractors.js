import { parse as htmlParse }  from 'node-html-parser';

function defaultArticleExtract(linkResponse) {
  const regex = /<p>(.*)<\/p>/g

  return linkResponse.data.match(regex).join()
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
}

function economistArticleExtract(linkResponse) {
  const parsedData = htmlParse(linkResponse.data)
  const parsedTextObject = JSON.parse(parsedData.childNodes[1].childNodes[1].childNodes[1].childNodes[0]._rawText)
  
  return parsedTextObject.props.pageProps.content.bodyText;
}

function alternetArticleExtract(linkResponse) {
  let text = '';

  function findChildText(childObj) {
    if (childObj._rawText && childObj.parentNode.parentNode.rawTagName !== 'li') {
      text += childObj._rawText;
    }
    if (childObj.childNodes && childObj.childNodes.length > 0) {
      childObj.childNodes.forEach(childNode => findChildText(childNode));
    }
  }

  function findAlternetText(obj) {
    if (obj.rawAttrs && obj.rawAttrs.includes('body-description')) {
      obj.childNodes.forEach(childNode => findChildText(childNode));
    }
    if (obj.childNodes && obj.childNodes.length > 0) {
      obj.childNodes.forEach(n=> {
        findAlternetText(n);
      })
    }
  }
  
  const parsedData = htmlParse(linkResponse.data);
  
  findAlternetText(parsedData);
  
  return text;
}

function reutersArticleExtract(linkResponse) {
  let text = '';
  
  function findChildText(childObj) {
    if (childObj._rawText && childObj._rawText.replace(/\s+/g, '') ) {
      text += childObj._rawText;
    }
    if (childObj.childNodes && childObj.childNodes.length > 0) {
      childObj.childNodes.forEach(childNode => findChildText(childNode));
    }
  }

  function findSourceText(obj) {
    if (obj.rawAttrs && obj.rawAttrs.includes('et_pb_post_content')) {
      obj.childNodes.forEach(childNode => findChildText(childNode));
    }
    if (obj.childNodes && obj.childNodes.length > 0) {
      obj.childNodes.forEach(n=> {
        findSourceText(n);
      })
    }
  }
  
  const parsedData = htmlParse(linkResponse.data);
  
  findSourceText(parsedData);
  
  return text;
}

function foxArticleExtract(linkResponse) {
  let text = '';
  
  function findChildText(childObj) {
    if (childObj._rawText && childObj._rawText.includes('articleBody')) {
      text = JSON.parse(childObj._rawText).articleBody;
    }
    if (childObj.childNodes && childObj.childNodes.length > 0) {
      childObj.childNodes.forEach(childNode => findChildText(childNode));
    }
  }

  function findSourceText(obj) {
    if (true) {
      obj.childNodes.forEach(childNode => findChildText(childNode));
    }
    if (obj.childNodes && obj.childNodes.length > 0) {
      obj.childNodes.forEach(n=> {
        findSourceText(n);
      })
    }
  }
  
  const parsedData = htmlParse(linkResponse.data);
  
  findSourceText(parsedData);
  
  return text;
}

function newsMaxArticleExtract(linkResponse) {
  let text = '';
  function findChildText(childObj) {
    if (
      childObj._rawText && childObj._rawText.replace(/\s+/g, '')
      && childObj.parentNode.parentNode.rawAttrs.includes('articleBody')
      && childObj.parentNode.parentNode.id === 'mainArticleDiv'
    ) {
      
      text += !text.includes(childObj._rawText) ? childObj._rawText : '';

    }

    if (childObj.childNodes && childObj.childNodes.length > 0) {
      childObj.childNodes.forEach(childNode => findChildText(childNode));
    }
  }

  function findSourceText(obj) {
    if (obj.rawAttrs) {
      obj.childNodes.forEach(childNode => findChildText(childNode));
    }
    if (obj.childNodes && obj.childNodes.length > 0) {
      obj.childNodes.forEach(n=> {
        findSourceText(n);
      })
    }
  }
  
  const parsedData = htmlParse(linkResponse.data);
  
  findSourceText(parsedData);
  
  return text;
}

module.exports = {
  alternetArticleExtract,
  defaultArticleExtract,
  economistArticleExtract,
  foxArticleExtract,
  newsMaxArticleExtract,
  reutersArticleExtract,
}