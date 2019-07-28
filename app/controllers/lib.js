const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getStructure = (dom) => {
  const { window: { document } } = new JSDOM(`<!DOCTYPE html><p>${dom}</p>`);

  let startNode = document.querySelector('[id=main-content]')


  let ownUrl = 'https://confluence.int.gazprombank.ru/pages/viewpage.action?pageId=59082771'


  let widgets = {
    tabs: '[class*=aui-tabs]',
    expander: '[data-macro-name=expand]',
    icon: '.confluence-embedded-file-wrapper',
    informer: '[data-macro-name=info]',
    innerLink: `[href*="${ownUrl}"]`
  }

  function floatWidget(parentNode) {
    const widgetTypes = widgets
    if (!containWidgets(parentNode, widgets)) {
      return { rowHtml: parentNode.outerHTML || parentNode.textContent}
    }
    let children = parentNode.childNodes
    let floated = [...children].map(node => {
      if (ifWidget(node, widgets)) {
        return parseWidget(node, widgets)
      }
      if (!containWidgets(node, widgets)) {
        return { rowHtml: node.outerHTML || node.textContent}
      }
      return floatWidget(node)
    })
    return floated
  }

  const toSelectors = (widgetTypes) => Object.values(widgetTypes)
    .toString()

  const containWidgets = (node, widgetTypes) => {
    return (node.nodeType !== 3) && (node.nodeType !== 8) && !!node.querySelectorAll(toSelectors(widgetTypes)).length
  }

  const ifWidget = (node, widgetTypes) => {
    return (node.nodeType !== 3) && (node.nodeType !== 8) && node.matches(toSelectors(widgetTypes))
  }

  const parseWidget = (node, widgetTypes) => {
    const meta = Object
      .entries(widgetTypes)
      .find(([_, selector]) => node.matches(selector))
    return widgetParsers[meta[0]](node)
  }

  const selectClosestChildren = (parent, selector, ifSingle) => {
    if (ifSingle) {
      const node = parent.querySelector(selector)
      return node.parentElement === parent ? node : null
    }
    const nodes = parent.querySelectorAll(selector)
    if (!nodes || !nodes.length) {
      return []
    }
    return [...nodes].filter(node =>
      node.parentElement === parent
    )
  }

  const widgetParsers = {
    tabs: container => {
      let id = container.getAttribute('id')
      let header = selectClosestChildren(container,'[role=tablist]', true)
      let tabHeaders = selectClosestChildren(header,'.menu-item')
      const menuItems = [...tabHeaders].map(headerItem => {
        return {
          text: headerItem.textContent || headerItem.innerText,
          id: headerItem.getAttribute('data-card-id')
        }
      })
      let panelsContainer = selectClosestChildren(container,'[role=tabpanel].deck-cards', true)
      let panels = [...selectClosestChildren(panelsContainer, '[role=tabpanel][data-macro-name=card]')]
        .map(panel => ({
          content: floatWidget(panel),
          id: panel.getAttribute('id')
        }))
      return {
        type: 'tabs',
        id,
        menuItems,
        panels
      }
    },
    expander: container => {
      let id = container.getAttribute('id')
      let control = selectClosestChildren(container,'.expand-control', true)
      let expandContainer = selectClosestChildren(container, '.expand-content', true)
      return {
        type: 'expander',
        id,
        control: floatWidget(control),
        expandContainer: floatWidget(expandContainer)
      }
    },
    icon: container => {
      let icon = container.querySelector('img').getAttribute('src')
      return {
        type: 'icon',
        icon
      }
    },
    informer: container => {
      let icon = selectClosestChildren(container, '.aui-icon', true)
        .getAttribute('class')
      const toBody = selectClosestChildren(container,'.confluence-information-macro-body', true)
      return {
        type: 'informer',
        icon,
        text: floatWidget(toBody)
      }
    },
    innerLink: container => {
      let linkId = container.getAttribute('href')
        .split('#')[1]
      return {
        type: 'innerLink',
        linkId,
        text: container.textContent || container.innerText
      }
    }
  }

  const result = floatWidget(startNode)
  return result
}

module.exports = { getStructure }
