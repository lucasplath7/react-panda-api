import { parse as htmlParse }  from 'node-html-parser';

function defaultArticleExtract(linkResponse) {
  const regex = /<p>(.*)<\/p>/g
  try {
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
  } catch (e) {
    console.log('error: ', e);
    console.log('Failed to extract news for link response');
  }
}

function economistArticleExtract(linkResponse) {
  const parsedData = htmlParse(linkResponse.data)
  // console.log('PARSED DATA: ', parsedData.childNodes[1].childNodes[1].childNodes[1].childNodes[0])
  
  const parsedTextObject = JSON.parse(parsedData.childNodes[1].childNodes[1].childNodes[1].childNodes[0]._rawText);
  // console.log('parsed obj ******************* : ', parsedTextObject.props.pageProps.content.text[0].children)
  // console.log('tag 1 : ', parsedTextObject.props.pageProps.content.text[0].children[0].children)
  // console.log('tag 2 : ', parsedTextObject.props.pageProps.content.text[0].children[1].children)
  // console.log('parsed obj 2 ******************* : ', parsedTextObject.props.pageProps.content.text[1].children)
  const articleText = parsedTextObject.props.pageProps.content.text.reduce((articleText, textObject) => {
    textObject.children.forEach((textChild) => {
      if (textChild.type === 'tag') {
        textChild.children.forEach((tagChild) => {
          articleText += tagChild.data;
        })
      } else {
        articleText += textChild.data;
      }
    });

    return articleText;
  }, '');
  // parsedTextObject.props.pageProps.content.text[0].children.forEach(child => {
  //   if (child.type === 'tag') {
  //     child.children.forEach(ch => {
  //       articleText += ch.data;
  //     })
  //   } else {
  //     articleText += child.data;
  //   }
  // })
  // console.log('\n\n\narticle text: ', articleText)
  return articleText;
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
      // console.log('child objt: ', childObj.parentNode.rawAttrs)
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