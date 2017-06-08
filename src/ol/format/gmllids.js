goog.provide('ol.format.GMLLids');

goog.require('ol');
// goog.require('ol.extent');
// goog.require('ol.format.Feature');
goog.require('ol.format.GML2');
goog.require('ol.format.GMLBase');
// goog.require('ol.format.XSD');
// goog.require('ol.geom.Geometry');
// goog.require('ol.obj');
// goog.require('ol.proj');
goog.require('ol.xml');


/**
 * @classdesc
 * Feature format for reading and writing data in the GML format,
 * version 2.1.2.
 *
 * @constructor
 * @param {olx.format.GMLOptions=} opt_options Optional configuration object.
 * @extends {ol.format.GML2}
 * @api
 */
ol.format.GMLLids = function (opt_options) {
  var options = /** @type {olx.format.GMLOptions} */
    (opt_options ? opt_options : {});

  ol.format.GML2.call(this, options);

  this.metadata = options.metadata || null;

};
ol.inherits(ol.format.GMLLids, ol.format.GML2);


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @override
 * @return {ol.Feature} Feature.
 */
ol.format.GMLLids.prototype.readFeatureElement = function (node, objectStack) {
  // var feature = Object.getPrototypeOf(ol.format.GMLB.prototype).readFeatureElement.call(this,node,objectStack);
  //
  // var fid = node.getAttribute('id');
  // feature.setId(fid);
  // return feature;

  var n;
  var fid = node.getAttribute('id') ||
    ol.xml.getAttributeNS(node, ol.format.GMLBase.GMLNS, 'id');
  var values = {}, geometryName;
  for (n = node.firstElementChild; n; n = n.nextElementSibling) {
    var localName = n.localName;
    var attributes = this.metadata.attributes;
    var attributedesc = null;
    for (var i = 0; i < attributes.length; i++) {
      if (attributes[i].id == localName) {
        attributedesc = attributes[i];
        break;
      }
    }

    // Assume attribute elements have one child node and that the child
    // is a text or CDATA node (to be treated as text).
    // Otherwise assume it is a geometry node.
    if (attributedesc) {
      var value = undefined;
      if (n.childNodes.length === 0 ||
        (n.childNodes.length === 1 &&
        (n.firstChild.nodeType === 3 || n.firstChild.nodeType === 4))) {
        value = ol.xml.getAllTextContent(n, false);
        // if (ol.format.GMLBase.ONLY_WHITESPACE_RE_.test(value)) {
        //   value = undefined;
        // }
        values[localName] = value;
      }
      else if (attributedesc.dataType.type == "CODELIST") {
        var nn;
        for (nn = n.firstElementChild; nn; nn = nn.nextElementSibling) {
          var localcodelistName = nn.localName;
          if (localcodelistName == attributedesc.dataType.displayColumn) {
            value = ol.xml.getAllTextContent(nn, false);
            // if (ol.format.GMLBase.ONLY_WHITESPACE_RE_.test(value)) {
            //   value = undefined;
            // }
            values[localName] = value;
            break;
          }
        }
      }
    }

    if (localName == "at_geom") {
      geometryName = localName;
      values[localName] = this.readGeometryElement(n, objectStack);
    }
  }
  var feature = new ol.Feature(values);
  if (geometryName) {
    feature.setGeometryName(geometryName);
  }
  if (fid) {
    feature.setId(fid);
  }
  return feature;
};
