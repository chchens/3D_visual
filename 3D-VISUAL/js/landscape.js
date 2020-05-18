/**
 * d3-x3dom
 *
 * @author James Saunders [james@saunders-family.net]
 * @copyright Copyright (C) 2019 James Saunders
 * @license GPLv2
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3')) :
	typeof define === 'function' && define.amd ? define(['d3'], factory) :
	(global.d3 = global.d3 || {}, global.d3.x3dom = factory(global.d3));
}(this, (function (d3) { 'use strict';

var version = "1.3.0";
var license = "GPL-2.0";

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/**
 * Data Transform
 *
 * @module
 * @returns {Array}
 */
function dataTransform(data) {

	var SINGLE_SERIES = 1;
	var MULTI_SERIES = 2;
	var coordinateKeys = ['x', 'y', 'z'];

	/**
  * Data Type
  *
  * @type {Number}
  */
	var dataType = data.key !== undefined ? SINGLE_SERIES : MULTI_SERIES;

	/**
  * Row Key
  *
  * @returns {Array}
  */
	var rowKey = function () {
		if (dataType === SINGLE_SERIES) {
			return d3.values(data)[0];
		}
	}();

	/**
  * Row Total
  *
  * @returns {Array}
  */
	var rowTotal = function () {
		if (dataType === SINGLE_SERIES) {
			return d3.sum(data.values, function (d) {
				return d.value;
			});
		}
	}();

	/**
  * Row Keys
  *
  * @returns {Array}
  */
	var rowKeys = function () {
		if (dataType === MULTI_SERIES) {
			return data.map(function (d) {
				return d.key;
			});
		}
	}();

	/**
  * Row Totals
  *
  * @returns {Array}
  */
	var rowTotals = function () {
		if (dataType === MULTI_SERIES) {
			var ret = {};
			d3.map(data).values().forEach(function (d) {
				var rowKey = d.key;
				d.values.forEach(function (d) {
					ret[rowKey] = typeof ret[rowKey] === "undefined" ? 0 : ret[rowKey];
					ret[rowKey] += d.value;
				});
			});
			return ret;
		}
	}();

	/**
  * Row Totals Max
  *
  * @returns {number}
  */
	var rowTotalsMax = function () {
		if (dataType === MULTI_SERIES) {
			return d3.max(d3.values(rowTotals));
		}
	}();

	/**
  * Row Value Keys
  *
  * @returns {Array}
  */
	var rowValuesKeys = function () {
		if (dataType === SINGLE_SERIES) {
			return Object.keys(data.values[0]);
		} else {
			return Object.keys(data[0].values[0]);
		}
	}();

	/**
  * Union Two Arrays
  *
  * @private
  * @param {Array} array1 - First Array.
  * @param {Array} array2 - First Array.
  * @returns {Array}
  */
	var union = function union(array1, array2) {
		var ret = [];
		var arr = array1.concat(array2);
		var len = arr.length;
		var assoc = {};

		while (len--) {
			var item = arr[len];

			if (!assoc[item]) {
				ret.unshift(item);
				assoc[item] = true;
			}
		}

		return ret;
	};

	/**
  * Column Keys
  *
  * @returns {Array}
  */
	var columnKeys = function () {
		if (dataType === SINGLE_SERIES) {
			return d3.values(data.values).map(function (d) {
				return d.key;
			});
		}

		var ret = [];
		d3.map(data).values().forEach(function (d) {
			var tmp = [];
			d.values.forEach(function (d, i) {
				tmp[i] = d.key;
			});
			ret = union(tmp, ret);
		});

		return ret;
	}();

	/**
  * Column Totals
  *
  * @returns {Array}
  */
	var columnTotals = function () {
		if (dataType !== MULTI_SERIES) {
			return;
		}

		var ret = {};
		d3.map(data).values().forEach(function (d) {
			d.values.forEach(function (d) {
				var columnName = d.key;
				ret[columnName] = typeof ret[columnName] === "undefined" ? 0 : ret[columnName];
				ret[columnName] += d.value;
			});
		});

		return ret;
	}();

	/**
  * Column Totals Max
  *
  * @returns {Array}
  */
	var columnTotalsMax = function () {
		if (dataType === MULTI_SERIES) {
			return d3.max(d3.values(columnTotals));
		}
	}();

	/**
  * Value Min
  *
  * @returns {number}
  */
	var valueMin = function () {
		if (dataType === SINGLE_SERIES) {
			return d3.min(data.values, function (d) {
				return +d.value;
			});
		}

		var ret = void 0;
		d3.map(data).values().forEach(function (d) {
			d.values.forEach(function (d) {
				ret = typeof ret === "undefined" ? d.value : d3.min([ret, +d.value]);
			});
		});

		return +ret;
	}();

	/**
  * Value Max
  *
  * @returns {number}
  */
	var valueMax = function () {
		var ret = void 0;

		if (dataType === SINGLE_SERIES) {
			ret = d3.max(data.values, function (d) {
				return +d.value;
			});
		} else {
			d3.map(data).values().forEach(function (d) {
				d.values.forEach(function (d) {
					ret = typeof ret !== "undefined" ? d3.max([ret, +d.value]) : +d.value;
				});
			});
		}

		return ret;
	}();

	/**
  * Value Extent
  *
  * @returns {Array}
  */
	var valueExtent = function () {
		return [valueMin, valueMax];
	}();

	/**
  * Coordinates Min
  *
  * @returns {Array}
  */
	var coordinatesMin = function () {
		var ret = {};

		if (dataType === SINGLE_SERIES) {
			coordinateKeys.forEach(function (key) {
				ret[key] = d3.min(data.values, function (d) {
					return +d[key];
				});
			});
			return ret;
		} else {
			d3.map(data).values().forEach(function (d) {
				d.values.forEach(function (d) {
					coordinateKeys.forEach(function (key) {
						ret[key] = key in ret ? d3.min([ret[key], +d[key]]) : d[key];
					});
				});
			});
		}

		return ret;
	}();

	/**
  * Coordinates Max
  *
  * @returns {Array}
  */
	var coordinatesMax = function () {
		var ret = {};

		if (dataType === SINGLE_SERIES) {
			coordinateKeys.forEach(function (key) {
				ret[key] = d3.max(data.values, function (d) {
					return +d[key];
				});
			});
			return ret;
		} else {
			d3.map(data).values().forEach(function (d) {
				d.values.forEach(function (d) {
					coordinateKeys.forEach(function (key) {
						ret[key] = key in ret ? d3.max([ret[key], +d[key]]) : d[key];
					});
				});
			});
		}

		return ret;
	}();

	/**
  * Coordinates Extent
  *
  * @returns {Array}
  */
	var coordinatesExtent = function () {
		var ret = {};
		coordinateKeys.forEach(function (key) {
			ret[key] = [coordinatesMin[key], coordinatesMax[key]];
		});

		return ret;
	}();

	/**
  * How Many Decimal Places?
  *
  * @private
  * @param {number} num - Float.
  * @returns {number}
  */
	var decimalPlaces = function decimalPlaces(num) {
		var match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
		if (!match) {
			return 0;
		}

		return Math.max(0,
		// Number of digits right of decimal point.
		(match[1] ? match[1].length : 0) - (
		// Adjust for scientific notation.
		match[2] ? +match[2] : 0));
	};

	/**
  * Max Decimal Place
  *
  * @returns {number}
  */
	var maxDecimalPlace = function () {
		var ret = 0;
		if (dataType === MULTI_SERIES) {
			d3.map(data).values().forEach(function (d) {
				d.values.forEach(function (d) {
					ret = d3.max([ret, decimalPlaces(d.value)]);
				});
			});
		}

		// toFixed must be between 0 and 20
		return ret > 20 ? 20 : ret;
	}();

	/**
  * Thresholds
  *
  * @returns {Array}
  */
	var thresholds = function () {
		var distance = valueMax - valueMin;
		var bands = [0.15, 0.40, 0.55, 0.90];

		return bands.map(function (v) {
			return Number((valueMin + v * distance).toFixed(maxDecimalPlace));
		});
	}();

	/**
  * Summary
  *
  * @returns {Array}
  */
	var summary = function summary() {
		return {
			dataType: dataType,
			rowKey: rowKey,
			rowTotal: rowTotal,
			rowKeys: rowKeys,
			rowTotals: rowTotals,
			rowTotalsMax: rowTotalsMax,
			rowValuesKeys: rowValuesKeys,
			columnKeys: columnKeys,
			columnTotals: columnTotals,
			columnTotalsMax: columnTotalsMax,
			valueMin: valueMin,
			valueMax: valueMax,
			valueExtent: valueExtent,
			coordinatesMin: coordinatesMin,
			coordinatesMax: coordinatesMax,
			coordinatesExtent: coordinatesExtent,
			maxDecimalPlace: maxDecimalPlace,
			thresholds: thresholds
		};
	};

	/**
  * Rotate Data
  *
  * @returns {Array}
  */
	var rotate = function rotate() {
		var columnKeys = data.map(function (d) {
			return d.key;
		});
		var rowKeys = data[0].values.map(function (d) {
			return d.key;
		});

		var rotated = rowKeys.map(function (rowKey, rowIndex) {
			var values = columnKeys.map(function (columnKey, columnIndex) {
				// Copy the values from the original object
				var values = _extends({}, data[columnIndex].values[rowIndex]);
				// Swap the key over
				values.key = columnKey;

				return values;
			});

			return {
				key: rowKey,
				values: values
			};
		});

		return rotated;
	};

	return {
		summary: summary,
		rotate: rotate
	};
}


/**
 * Reusable 3D Axis Component
 *
 * @module
 */
function componentAxis () {

	/* Default Properties */
	var dimensions = { x: 80, y: 40, z: 160 };
	var color = "black";
	var classed = "d3X3domAxis";
	var labelPosition = "proximal";
	var labelInset = labelPosition === "distal" ? 1 : -1;

	/* Scale and Axis Options */
	var scale = void 0;
	var direction = void 0;
	var tickDirection = void 0;
	var tickArguments = [];
	var tickValues = null;
	var tickFormat = null;
	var tickSize = 1;
	var tickPadding = 1.5;

	var axisDirectionVectors = {
		x: [1, 0, 0],
		y: [0, 1, 0],
		z: [0, 0, 1]
	};

	var axisRotationVectors = {
		x: [1, 1, 0, Math.PI],
		y: [0, 0, 0, 0],
		z: [0, 1, 1, Math.PI]
	};

	/**
  * Get Axis Direction Vector
  *
  * @private
  * @param {string} axisDir
  * @returns {number[]}
  */
	var getAxisDirectionVector = function getAxisDirectionVector(axisDir) {
		return axisDirectionVectors[axisDir];
	};

	/**
  * Get Axis Rotation Vector
  *
  * @private
  * @param {string} axisDir
  * @returns {number[]}
  */
	var getAxisRotationVector = function getAxisRotationVector(axisDir) {
		return axisRotationVectors[axisDir];
	};

	/**
  * Constructor
  *
  * @constructor
  * @alias axis
  * @param {d3.selection} selection - The chart holder D3 selection.
  */
	var my = function my(selection) {
		selection.each(function () {

			var element = d3.select(this).classed(classed, true);

			var makeSolid = function makeSolid(shape, color) {
				shape.append("appearance").append("material").attr("diffuseColor", color || "black");
				return shape;
			};

			var range = scale.range();
			var range0 = range[0];
			var range1 = range[range.length - 1];

			var axisDirectionVector = getAxisDirectionVector(direction);
			var tickDirectionVector = getAxisDirectionVector(tickDirection);
			var axisRotationVector = getAxisRotationVector(direction);
			var tickRotationVector = getAxisRotationVector(tickDirection);

			/*
   // FIXME: Currently the tickArguments option does not work.
   const tickValuesDefault = scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain();
   tickValues = tickValues === null ? tickValuesDefault : tickValues;
   */
			tickValues = scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain();

			var tickFormatDefault = scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : function (d) {
				return d;
			};
			tickFormat = tickFormat === null ? tickFormatDefault : tickFormat;

			// Main Lines
			var domain = element.selectAll(".domain").data([null]);

			var domainEnter = domain.enter().append("transform").attr("class", "domain").attr("rotation", axisRotationVector.join(" ")).attr("translation", axisDirectionVector.map(function (d) {
				return d * (range0 + range1) / 2;
			}).join(" ")).append("shape").call(makeSolid, color).append("cylinder").attr("radius", 0.1).attr("height", range1 - range0);

			domainEnter.merge(domain);

			domain.exit().remove();

			// Tick Lines
			var ticks = element.selectAll(".tick").data(tickValues);

			var ticksEnter = ticks.enter().append("transform").attr("class", "tick").attr("translation", function (t) {
				return axisDirectionVector.map(function (a) {
					return scale(t) * a;
				}).join(" ");
			}).append("transform").attr("translation", tickDirectionVector.map(function (d) {
				return d * tickSize / 2;
			}).join(" ")).attr("rotation", tickRotationVector.join(" ")).append("shape").call(makeSolid, "#d3d3d3").append("cylinder").attr("radius", 0.05).attr("height", tickSize);

			ticksEnter.merge(ticks);

			ticks.transition().attr("translation", function (t) {
				return axisDirectionVector.map(function (a) {
					return scale(t) * a;
				}).join(" ");
			});

			ticks.exit().remove();

			// Labels
			if (tickFormat !== "") {
				var labels = element.selectAll(".label").data(tickValues);

				var labelsEnter = ticks.enter().append("transform").attr("class", "label").attr("translation", function (t) {
					return axisDirectionVector.map(function (a) {
						return scale(t) * a;
					}).join(" ");
				}).append("transform").attr("translation", tickDirectionVector.map(function (d, i) {
					return labelInset * d * tickPadding + (labelInset + 1) / 2 * (range1 - range0) * tickDirectionVector[i];
				})).append("billboard").attr("axisofrotation", "0 0 0").append("shape").call(makeSolid, "black").append("text").attr("string", tickFormat).append("fontstyle").attr("size", 1.3).attr("family", "SANS").attr("style", "BOLD").attr("justify", "MIDDLE");

				labelsEnter.merge(labels);

				labels.transition().attr("translation", function (t) {
					return axisDirectionVector.map(function (a) {
						return scale(t) * a;
					}).join(" ");
				}).select("transform").attr("translation", tickDirectionVector.map(function (d, i) {
					return labelInset * d * tickPadding + (labelInset + 1) / 2 * (range1 - range0) * tickDirectionVector[i];
				})).on("start", function () {
					d3.select(this).select("billboard").select("shape").select("text").attr("string", tickFormat);
				});

				labels.exit().remove();
			}
		});
	};

	/**
  * Dimensions Getter / Setter
  *
  * @param {{x: number, y: number, z: number}} _v - 3D object dimensions.
  * @returns {*}
  */
	my.dimensions = function (_v) {
		if (!arguments.length) return dimensions;
		dimensions = _v;
		return my;
	};

	/**
  * Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 Scale.
  * @returns {*}
  */
	my.scale = function (_v) {
		if (!arguments.length) return scale;
		scale = _v;
		return my;
	};

	/**
  * Direction Getter / Setter
  *
  * @param {string} _v - Direction of Axis (e.g. 'x', 'y', 'z').
  * @returns {*}
  */
	my.direction = function (_v) {
		if (!arguments.length) return direction;
		direction = _v;
		return my;
	};

	/**
  * Tick Direction Getter / Setter
  *
  * @param {string} _v - Direction of Ticks (e.g. 'x', 'y', 'z').
  * @returns {*}
  */
	my.tickDirection = function (_v) {
		if (!arguments.length) return tickDirection;
		tickDirection = _v;
		return my;
	};

	/**
  * Tick Arguments Getter / Setter
  *
  * @param {Array} _v - Tick arguments.
  * @returns {Array<*>}
  */
	my.tickArguments = function (_v) {
		if (!arguments.length) return tickArguments;
		tickArguments = _v;
		return my;
	};

	/**
  * Tick Values Getter / Setter
  *
  * @param {Array} _v - Tick values.
  * @returns {*}
  */
	my.tickValues = function (_v) {
		if (!arguments.length) return tickValues;
		tickValues = _v;
		return my;
	};

	/**
  * Tick Format Getter / Setter
  *
  * @param {string} _v - Tick format.
  * @returns {*}
  */
	my.tickFormat = function (_v) {
		if (!arguments.length) return tickFormat;
		tickFormat = _v;
		return my;
	};

	/**
  * Tick Size Getter / Setter
  *
  * @param {number} _v - Tick length.
  * @returns {*}
  */
	my.tickSize = function (_v) {
		if (!arguments.length) return tickSize;
		tickSize = _v;
		return my;
	};

	/**
  * Tick Padding Getter / Setter
  *
  * @param {number} _v - Tick padding size.
  * @returns {*}
  */
	my.tickPadding = function (_v) {
		if (!arguments.length) return tickPadding;
		tickPadding = _v;
		return my;
	};

	/**
  * Color Getter / Setter
  *
  * @param {string} _v - Color (e.g. 'red' or '#ff0000').
  * @returns {*}
  */
	my.color = function (_v) {
		if (!arguments.length) return color;
		color = _v;
		return my;
	};

	/**
  * Label Position Getter / Setter
  *
  * @param {string} _v - Position ('proximal' or 'distal')
  * @returns {*}
  */
	my.labelPosition = function (_v) {
		if (!arguments.length) return labelPosition;
		labelPosition = _v;
		labelInset = labelPosition === "distal" ? 1 : -1;
		return my;
	};

	return my;
}

/**
 * Reusable 3D Multi Plane Axis Component
 *
 * @module
 */
function componentAxisThreePlane () {

	/* Default Properties */
	var dimensions = { x: 80, y: 40, z: 160 };
	var colors = ["blue", "red", "green"];
	var classed = "d3X3domAxisThreePlane";
	var labelPosition = "proximal";

	/* Scales */
	var xScale = void 0;
	var yScale = void 0;
	var zScale = void 0;

	/* Components */
	var xzAxis = componentAxis();
	var yzAxis = componentAxis();
	var yxAxis = componentAxis();
	var zxAxis = componentAxis();

	/**
  * Constructor
  *
  * @constructor
  * @alias axisThreePlane
  * @param {d3.selection} selection - The chart holder D3 selection.
  */
	var my = function my(selection) {
		selection.each(function () {

			var element = d3.select(this).classed(classed, true);

			var layers = ["xzAxis", "yzAxis", "yxAxis", "zxAxis"];

			element.selectAll("group").data(layers).enter().append("group").attr("class", function (d) {
				return d;
			});

			xzAxis.scale(xScale).direction("x").tickDirection("z").tickSize(zScale.range()[1] - zScale.range()[0]).color("blue").labelPosition(labelPosition);

			yzAxis.scale(yScale).direction("y").tickDirection("z").tickSize(zScale.range()[1] - zScale.range()[0]).color("red").labelPosition(labelPosition);

			yxAxis.scale(yScale).direction("y").tickDirection("x").tickSize(xScale.range()[1] - xScale.range()[0]).tickFormat("").color("red").labelPosition(labelPosition);

			zxAxis.scale(zScale).direction("z").tickDirection("x").tickSize(xScale.range()[1] - xScale.range()[0]).color("black").labelPosition(labelPosition);

			element.select(".xzAxis").call(xzAxis);

			element.select(".yzAxis").call(yzAxis);

			element.select(".yxAxis").call(yxAxis);

			element.select(".zxAxis").call(zxAxis);
		});
	};

	/**
  * Dimensions Getter / Setter
  *
  * @param {{x: number, y: number, z: number}} _v - 3D object dimensions.
  * @returns {*}
  */
	my.dimensions = function (_v) {
		if (!arguments.length) return dimensions;
		dimensions = _v;
		return this;
	};

	/**
  * X Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.xScale = function (_v) {
		if (!arguments.length) return xScale;
		xScale = _v;
		return my;
	};

	/**
  * Y Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.yScale = function (_v) {
		if (!arguments.length) return yScale;
		yScale = _v;
		return my;
	};

	/**
  * Z Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.zScale = function (_v) {
		if (!arguments.length) return zScale;
		zScale = _v;
		return my;
	};

	/**
  * Colors Getter / Setter
  *
  * @param {Array} _v - Array of colours used by color scale.
  * @returns {*}
  */
	my.colors = function (_v) {
		if (!arguments.length) return colors;
		colors = _v;
		return my;
	};

	/**
  * Label Position Getter / Setter
  *
  * @param {string} _v - Position ('proximal' or 'distal')
  * @returns {*}
  */
	my.labelPosition = function (_v) {
		if (!arguments.length) return labelPosition;
		labelPosition = _v;
		return my;
	};

	return my;
}

/**
 * Custom Dispatch Events
 *
 * @type {d3.dispatch}
 */
var dispatch = d3.dispatch("d3X3domClick", "d3X3domMouseOver", "d3X3domMouseOut");

/**
 * Forward X3DOM Event to D3
 *
 * In X3DOM, it is the canvas which captures onclick events, therefore defining a D3 event handler
 * on an single X3DOM element does not work. A workaround is to define an onclick handler which then
 * forwards the call to the D3 'click' event handler with the event.
 * Note: X3DOM and D3 event members slightly differ, so d3.mouse() function does not work.
 *
 * @param {event} event
 * @see https://bl.ocks.org/hlvoorhees/5376764
 */
function forwardEvent(event) {
	var type = event.type;
	var target = d3.select(event.target);
	target.on(type)(event);
}

/**
 * Show Alert With Event Coordinate
 *
 * @param {event} event
 * @returns {{canvas: {x: (*|number), y: (*|number)}, world: {x: *, y: *, z: *}, page: {x: number, y: number}}}
 */
function getEventCoordinates(event) {
	var pagePoint = getEventPagePoint(event);

	return {
		world: { x: event.hitPnt[0], y: event.hitPnt[1], z: event.hitPnt[2] },
		canvas: { x: event.layerX, y: event.layerY },
		page: { x: pagePoint.x, y: pagePoint.y }
	};
}

/**
 * Inverse of coordinate transform defined by function mousePosition(evt) in x3dom.js
 *
 * @param {event} event
 * @returns {{x: number, y: number}}
 */
function getEventPagePoint(event) {
	var pageX = -1;
	var pageY = -1;

	var convertPoint = window.webkitConvertPointFromPageToNode;

	if ("getBoundingClientRect" in document.documentElement) {
		var holder = getX3domHolder(event);
		var computedStyle = document.defaultView.getComputedStyle(holder, null);
		var paddingLeft = parseFloat(computedStyle.getPropertyValue('padding-left'));
		var borderLeftWidth = parseFloat(computedStyle.getPropertyValue('border-left-width'));
		var paddingTop = parseFloat(computedStyle.getPropertyValue('padding-top'));
		var borderTopWidth = parseFloat(computedStyle.getPropertyValue('border-top-width'));
		var box = holder.getBoundingClientRect();
		var scrolLeft = window.pageXOffset || document.body.scrollLeft;
		var scrollTop = window.pageYOffset || document.body.scrollTop;
		pageX = Math.round(event.layerX + (box.left + paddingLeft + borderLeftWidth + scrolLeft));
		pageY = Math.round(event.layerY + (box.top + paddingTop + borderTopWidth + scrollTop));
	} else if (convertPoint) {
		var pagePoint = convertPoint(event.target, new WebKitPoint(0, 0));
		pageX = Math.round(pagePoint.x);
		pageY = Math.round(pagePoint.y);
	} else {
		x3dom.debug.logError('Unable to find getBoundingClientRect or webkitConvertPointFromPageToNode');
	}

	return { x: pageX, y: pageY };
}

/**
 * Return the x3d Parent Holder
 *
 * Find clicked element, walk up DOM until we find the parent x3d.
 * Then return the x3d's parent.
 *
 * @param event
 * @returns {*}
 */
function getX3domHolder(event) {
	var target = d3.select(event.target);

	var x3d = target.select(function () {
		var el = this;
		while (el.nodeName.toLowerCase() !== "x3d") {
			el = el.parentElement;
		}

		return el;
	});

	return x3d.select(function () {
		return this.parentNode;
	}).node();
}

var events = Object.freeze({
	dispatch: dispatch,
	forwardEvent: forwardEvent,
	getEventCoordinates: getEventCoordinates,
	getEventPagePoint: getEventPagePoint,
	getX3domHolder: getX3domHolder
});


/**
 * Reusable 3D Surface Area Component
 *
 * @module
 */
function componentSurface () {

	/* Default Properties */
	var dimensions = { x: 80, y: 40, z: 160 };
	var colors = ["green", "red"];
	var classed = "d3X3domSurface";

	/* Scales */
	var xScale = void 0;
	var yScale = void 0;
	var zScale = void 0;
	var colorScale = void 0;

	var array2dToString = function array2dToString(arr) {
		return arr.reduce(function (a, b) {
			return a.concat(b);
		}, []).reduce(function (a, b) {
			return a.concat(b);
		}, []).join(" ");
	};

	/**
  * Initialise Data and Scales
  *
  * @private
  * @param {Array} data - Chart data.
  */
	var init = function init(data) {
		var _dataTransform$summar = dataTransform(data).summary(),
		    rowKeys = _dataTransform$summar.rowKeys,
		    columnKeys = _dataTransform$summar.columnKeys,
		    valueMax = _dataTransform$summar.valueMax;

		var valueExtent = [600, 950];
		var _dimensions = dimensions,
		    dimensionX = _dimensions.x,
		    dimensionY = _dimensions.y,
		    dimensionZ = _dimensions.z;


		if (typeof xScale === "undefined") {
			xScale = d3.scalePoint().domain(rowKeys).range([0, dimensionX]);
		}

		if (typeof yScale === "undefined") {
			yScale = d3.scaleLinear().domain(valueExtent).range([0, dimensionY]);
		}

		if (typeof zScale === "undefined") {
			zScale = d3.scalePoint().domain(columnKeys).range([0, dimensionZ]);
		}

		if (typeof colorScale === "undefined") {
			colorScale = d3.scaleLinear().domain([600,950]).range(colors).interpolate(d3.interpolateRgb);
		}
	};

	/**
  * Constructor
  *
  * @constructor
  * @alias surface
  * @param {d3.selection} selection - The chart holder D3 selection.
  */
	var my = function my(selection) {
		selection.each(function (data) {
			init(data);

			var element = d3.select(this).classed(classed, true);

			var surfaceData = function surfaceData(d) {

				var coordPoints = function coordPoints(data) {
					return data.map(function (X) {
						return X.values.map(function (d) {
							return [xScale(X.key), yScale(d.value), zScale(d.key)];
						});
					});
				};

				var coordIndex = function coordIndex(data) {
					var ny = data.length;
					var nx = data[0].values.length;

					var coordIndexFront = Array.apply(0, Array(ny - 1)).map(function (_, j) {
						return Array.apply(0, Array(nx - 1)).map(function (_, i) {
							var start = i + j * nx;
							return [start, start + nx, start + nx + 1, start + 1, start, -1];
						});
					});

					var coordIndexBack = Array.apply(0, Array(ny - 1)).map(function (_, j) {
						return Array.apply(0, Array(nx - 1)).map(function (_, i) {
							var start = i + j * nx;
							return [start, start + 1, start + nx + 1, start + nx, start, -1];
						});
					});

					return coordIndexFront.concat(coordIndexBack);
				};

				var colorFaceSet = function colorFaceSet(data) {
					return data.map(function (X) {
						return X.values.map(function (d) {
							var col = d3.color(colorScale(d.value));
							return '' + Math.round(col.r / 2.55) / 100 + ' ' + Math.round(col.g / 2.55) / 100 + ' ' + Math.round(col.b / 2.55) / 100;
						});
					});
				};

				return [{
					coordindex: array2dToString(coordIndex(d)),
					point: array2dToString(coordPoints(d)),
					color: array2dToString(colorFaceSet(d))
				}];
			};

			var surface = element.selectAll(".surface").data(surfaceData);

			var surfaceSelect = surface.enter().append("shape").classed("surface", true).append("indexedfaceset").attr("coordindex", function (d) {
				return d.coordindex;
			});

			surfaceSelect.append("coordinate").attr("point", function (d) {
				return d.point;
			});

			surfaceSelect.append("color").attr("color", function (d) {
				return d.color;
			});

			surfaceSelect.merge(surface);

			var surfaceTransition = surface.transition().select("indexedfaceset").attr("coordindex", function (d) {
				return d.coordindex;
			});

			surfaceTransition.select("coordinate").attr("point", function (d) {
				return d.point;
			});

			surfaceTransition.select("color").attr("color", function (d) {
				return d.color;
			});

			surface.exit().remove();
		});
	};

	/**
  * Dimensions Getter / Setter
  *
  * @param {{x: number, y: number, z: number}} _v - 3D object dimensions.
  * @returns {*}
  */
	my.dimensions = function (_v) {
		if (!arguments.length) return dimensions;
		dimensions = _v;
		return this;
	};

	/**
  * X Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.xScale = function (_v) {
		if (!arguments.length) return xScale;
		xScale = _v;
		return my;
	};

	/**
  * Y Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.yScale = function (_v) {
		if (!arguments.length) return yScale;
		yScale = _v;
		return my;
	};

	/**
  * Z Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.zScale = function (_v) {
		if (!arguments.length) return zScale;
		zScale = _v;
		return my;
	};

	/**
  * Color Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 color scale.
  * @returns {*}
  */
	my.colorScale = function (_v) {
		if (!arguments.length) return colorScale;
		colorScale = _v;
		return my;
	};

	/**
  * Colors Getter / Setter
  *
  * @param {Array} _v - Array of colours used by color scale.
  * @returns {*}
  */
	my.colors = function (_v) {
		if (!arguments.length) return colors;
		colors = _v;
		return my;
	};

	/**
  * Dispatch On Getter
  *
  * @returns {*}
  */
	my.on = function () {
		var value = dispatch.on.apply(dispatch, arguments);
		return value === dispatch ? my : value;
	};

	return my;
}



/**
 * Reusable X3DOM Viewpoint Component
 *
 * @module
 */
function componentViewpoint () {

	/* Default Properties */
	var centerOfRotation = [0.0, 0.0, 0.0];
	var viewPosition = [150.0, 20.0, 200.0];
	var viewOrientation = [0.0, 1.0, 0.0, 0.8];
	var fieldOfView = 0.8;
	var classed = "d3X3domViewpoint";

	/**
  * Constructor
  *
  * @constructor
  * @alias viewpoint
  * @param {d3.selection} selection - The chart holder D3 selection.
  */
	var my = function my(selection) {
		selection.each(function () {

			var element = d3.select(this).classed(classed, true);

			// Main Lines
			var viewpoint = element.selectAll("viewpoint").data([null]);

			viewpoint.enter().append("viewpoint").attr("centerofrotation", centerOfRotation.join(" ")).attr("position", viewPosition.join(" ")).attr("orientation", viewOrientation.join(" ")).attr("fieldofview", fieldOfView).attr("set_bind", "true").merge(viewpoint);
		});
	};

	/**
  * Set Quick Viewpoint
  *
  * @param {string} view - 'left', 'side', 'top', 'dimetric'
  * @returns {my}
  */
	my.quickView = function (view) {
		switch (view) {
			case "left":
				centerOfRotation = [0.0, 0.0, 0.0];
				viewPosition = [37.10119, 18.70484, 51.01594];
				viewOrientation = [0.06724, 0.99767, -0.01148, 0.33908];
				fieldOfView = 1.0;
				break;

			case "side":
				centerOfRotation = [20.0, 0.0, 0.0];
				viewPosition = [20.00000, 20.00000, 50.00000];
				viewOrientation = [0.00000, 0.00000, 0.00000, 0.00000];
				fieldOfView = 1.0;
				break;

			case "top":
				centerOfRotation = [0.0, 0.0, 0.0];
				viewPosition = [27.12955, 106.67181, 31.65828];
				viewOrientation = [-0.86241, 0.37490, 0.34013, 1.60141];
				fieldOfView = 1.0;
				break;

			case "dimetric":
			default:
				centerOfRotation = [0.0, 0.0, 0.0];
				viewPosition = [80.0, 15.0, 80.0];
				viewOrientation = [0.0, 1.0, 0.0, 0.8];
				fieldOfView = 0.8;
		}
		return my;
	};

	/**
  * Centre of Rotation Getter / Setter
  *
  * @param {number[]} _v - Centre of rotation.
  * @returns {*}
  */
	my.centerOfRotation = function (_v) {
		if (!arguments.length) return centerOfRotation;
		centerOfRotation = _v;
		return my;
	};

	/**
  * View Position Getter / Setter
  *
  * @param {number[]} _v - View position.
  * @returns {*}
  */
	my.viewPosition = function (_v) {
		if (!arguments.length) return viewPosition;
		viewPosition = _v;
		return my;
	};

	/**
  * View Orientation Getter / Setter
  *
  * @param {number[]} _v - View orientation.
  * @returns {*}
  */
	my.viewOrientation = function (_v) {
		if (!arguments.length) return viewOrientation;
		viewOrientation = _v;
		return my;
	};

	/**
  * Field of View Getter / Setter
  *
  * @param {number} _v - Field of view.
  * @returns {*}
  */
	my.fieldOfView = function (_v) {
		if (!arguments.length) return fieldOfView;
		fieldOfView = _v;
		return my;
	};

	return my;
}


var component = {
	
	axis: componentAxis,
	axisThreePlane: componentAxisThreePlane,

	surface: componentSurface,
	viewpoint: componentViewpoint

};

/**
 * Reusable 3D Surface Plot Chart
 *
 * @module
 *
 * @example
 * let chartHolder = d3.select("#chartholder");
 *
 * let myData = [...];
 *
 * let myChart = d3.x3dom.chart.surfacePlot();
 *
 * chartHolder.datum(myData).call(myChart);
 *
 * @see https://datavizproject.com/data-type/three-dimensional-stream-graph/
 */
function chartSurfacePlot () {

	var x3d = void 0;
	var scene = void 0;

	/* Default Properties */
	var width = 1300;
	var height = 500;
	var dimensions = { x: 80, y: 40, z: 160 };
	var colors = ['rgb(0,0,255)','rgb(255,0,0)'];
	var classed = "d3X3domSurfacePlot";
	var debug = false;

	/* Scales */
	var xScale = void 0;
	var yScale = void 0;
	var zScale = void 0;
	var colorScale = void 0;

	/* Components */
	var viewpoint = component.viewpoint();
	var axis = component.axisThreePlane();
	var surface = component.surface();

	/**
  * Initialise Data and Scales
  *
  * @private
  * @param {Array} data - Chart data.
  */
	var init = function init(data) {
		var _dataTransform$summar = dataTransform(data).summary(),
		    rowKeys = _dataTransform$summar.rowKeys,
		    columnKeys = _dataTransform$summar.columnKeys,
		    valueMax = _dataTransform$summar.valueMax;

		var valueExtent = [600, 950];
		var _dimensions = dimensions,
		    dimensionX = _dimensions.x,
		    dimensionY = _dimensions.y,
		    dimensionZ = _dimensions.z;


		xScale = d3.scalePoint().domain(rowKeys).range([0, dimensionX]);

		yScale = d3.scaleLinear().domain(valueExtent).range([0, dimensionY]).nice();

		zScale = d3.scalePoint().domain(columnKeys).range([0, dimensionZ]);

		colorScale = d3.scaleLinear().domain([800, 950]).range(colors).interpolate(d3.interpolateHcl);
        //interpolateRdYlBu(t)
        //d3.interpolateSpectral(t)
	};

	/**
  * Constructor
  *
  * @constructor
  * @alias surfacePlot
  * @param {d3.selection} selection - The chart holder D3 selection.
  */
	var my = function my(selection) {
		// Create x3d element (if it does not exist already)
		if (!x3d) {
			x3d = selection.append("x3d");
			scene = x3d.append("scene");
		}

		x3d.attr("width", width + "px").attr("height", height + "px").attr("showLog", debug ? "true" : "false").attr("showStat", debug ? "true" : "false");

		// Update the chart dimensions and add layer groups
		var layers = ["axis", "surface"];
		scene.classed(classed, true).selectAll("group").data(layers).enter().append("group").attr("class", function (d) {
			return d;
		});

		selection.each(function (data) {
			init(data);

			// Add Viewpoint
			viewpoint.centerOfRotation([dimensions.x / 2, dimensions.y / 2, dimensions.z / 2]);

			scene.call(viewpoint);

			// Add Axis
			axis.xScale(xScale).yScale(yScale).zScale(zScale).labelPosition("proximal");

			scene.select(".axis").call(axis);

			// Add Surface Area
			surface.xScale(xScale).yScale(yScale).zScale(zScale).colors(colors);

			scene.select(".surface").datum(data).call(surface);
		});
	};

	/**
  * Width Getter / Setter
  *
  * @param {number} _v - X3D canvas width in px.
  * @returns {*}
  */
	my.width = function (_v) {
		if (!arguments.length) return width;
		width = _v;
		return this;
	};

	/**
  * Height Getter / Setter
  *
  * @param {number} _v - X3D canvas height in px.
  * @returns {*}
  */
	my.height = function (_v) {
		if (!arguments.length) return height;
		height = _v;
		return this;
	};

	/**
  * Dimensions Getter / Setter
  *
  * @param {{x: number, y: number, z: number}} _v - 3D object dimensions.
  * @returns {*}
  */
	my.dimensions = function (_v) {
		if (!arguments.length) return dimensions;
		dimensions = _v;
		return this;
	};

	/**
  * X Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.xScale = function (_v) {
		if (!arguments.length) return xScale;
		xScale = _v;
		return my;
	};

	/**
  * Y Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.yScale = function (_v) {
		if (!arguments.length) return yScale;
		yScale = _v;
		return my;
	};

	/**
  * Z Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 scale.
  * @returns {*}
  */
	my.zScale = function (_v) {
		if (!arguments.length) return zScale;
		zScale = _v;
		return my;
	};

	/**
  * Color Scale Getter / Setter
  *
  * @param {d3.scale} _v - D3 color scale.
  * @returns {*}
  */
	my.colorScale = function (_v) {
		if (!arguments.length) return colorScale;
		colorScale = _v;
		return my;
	};

	/**
  * Colors Getter / Setter
  *
  * @param {Array} _v - Array of colours used by color scale.
  * @returns {*}
  */
	my.colors = function (_v) {
		if (!arguments.length) return colors;
		colors = _v;
		return my;
	};

	/**
  * Debug Getter / Setter
  *
  * @param {boolean} _v - Show debug log and stats. True/False.
  * @returns {*}
  */
	my.debug = function (_v) {
		if (!arguments.length) return debug;
		debug = _v;
		return my;
	};

	return my;
}



var chart = {
	surfacePlot: chartSurfacePlot
};


/**
 * Random Number Generator between 1 and 10
 *
 * @returns {number}
 */
function randomNum() {
	return Math.floor(Math.random() * 10) + 1;
}

/**
 * Random Dataset - Surface Plot 1
 *
 * @returns {Array}
 */
function dataset4() {
	var data = [{
		key: '2016/6/1',
		values: [{ key: '0:00:00', value: 847 }, { key: '0:10:00', value: 870 }, { key: '0:20:00', value: 874 }, { key: '0:30:00', value: 876 }, { key: '0:40:00', value: 873 }, { key: '0:50:00', value: 875 }, { key: '1:00:00', value: 867 }, { key: '1:10:00', value: 861 }, { key: '1:20:00', value: 859 }, { key: '1:30:00', value: 863 }, { key: '1:40:00', value: 854 }, { key: '1:50:00', value: 839 }, { key: '2:00:00', value: 838 }, { key: '2:10:00', value: 835 }, { key: '2:20:00', value: 834 }, { key: '2:30:00', value: 827 }, { key: '2:40:00', value: 824 }, { key: '2:50:00', value: 817 }, { key: '3:00:00', value: 818 }, { key: '3:10:00', value: 815 }, { key: '3:20:00', value: 814 }, { key: '3:30:00', value: 807 }, { key: '3:40:00', value: 807 }, { key: '3:50:00', value: 803 }, { key: '4:00:00', value: 800 }, { key: '4:10:00', value: 800 }, { key: '4:20:00', value: 806 }, { key: '4:30:00', value: 801 }, { key: '4:40:00', value: 800 }, { key: '4:50:00', value: 804 }, { key: '5:00:00', value: 803 }, { key: '5:10:00', value: 805 }, { key: '5:20:00', value: 807 }, { key: '5:30:00', value: 809 }, { key: '5:40:00', value: 814 }, { key: '5:50:00', value: 834 }, { key: '6:00:00', value: 850 }, { key: '6:10:00', value: 809 }, { key: '6:20:00', value: 922 }, { key: '6:30:00', value: 945 }, { key: '6:40:00', value: 945 }, { key: '6:50:00', value: 933 }, { key: '7:00:00', value: 934 }, { key: '7:10:00', value: 937 }, { key: '7:20:00', value: 936 }, { key: '7:30:00', value: 938 }, { key: '7:40:00', value: 936 }, { key: '7:50:00', value: 933 }, { key: '8:00:00', value: 902 }, { key: '8:10:00', value: 886 }, { key: '8:20:00', value: 881 }, { key: '8:30:00', value: 881 }, { key: '8:40:00', value: 902 }, { key: '8:50:00', value: 900 }, { key: '9:00:00', value: 903 }, { key: '9:10:00', value: 900 }, { key: '9:20:00', value: 927 }, { key: '9:30:00', value: 957 }, { key: '9:40:00', value: 965 }, { key: '9:50:00', value: 926 }, { key: '10:00:00', value: 870 }, { key: '10:10:00', value: 759 }, { key: '10:20:00', value: 733 }, { key: '10:30:00', value: 727 }, { key: '10:40:00', value: 735 }, { key: '10:50:00', value: 719 }, { key: '11:00:00', value: 699 }, { key: '11:10:00', value: 701 }, { key: '11:20:00', value: 681 }, { key: '11:30:00', value: 636 }, { key: '11:40:00', value: 661 }, { key: '11:50:00', value: 657 }, { key: '12:00:00', value: 683 }, { key: '12:10:00', value: 698 }, { key: '12:20:00', value: 704 }, { key: '12:30:00', value: 737 }, { key: '12:40:00', value: 749 }, { key: '12:50:00', value: 790 }, { key: '13:00:00', value: 850 }, { key: '13:10:00', value: 883 }, { key: '13:20:00', value: 884 }, { key: '13:30:00', value: 885 }, { key: '13:40:00', value: 889 }, { key: '13:50:00', value: 889 }, { key: '14:00:00', value: 883 }, { key: '14:10:00', value: 876 }, { key: '14:20:00', value: 884 }, { key: '14:30:00', value: 876 }, { key: '14:40:00', value: 871 }, { key: '14:50:00', value: 869 }, { key: '15:00:00', value: 860 }, { key: '15:10:00', value: 873 }, { key: '15:20:00', value: 881 }, { key: '15:30:00', value: 881 }, { key: '15:40:00', value: 880 }, { key: '15:50:00', value: 873 }, { key: '16:00:00', value: 878 }, { key: '16:10:00', value: 877 }, { key: '16:20:00', value: 879 }, { key: '16:30:00', value: 874 }, { key: '16:40:00', value: 857 }, { key: '16:50:00', value: 830 }, { key: '17:00:00', value: 781 }, { key: '17:10:00', value: 758 }, { key: '17:20:00', value: 749 }, { key: '17:30:00', value: 735 }, { key: '17:40:00', value: 713 }, { key: '17:50:00', value: 700 }, { key: '18:00:00', value: 694 }, { key: '18:10:00', value: 687 }, { key: '18:20:00', value: 679 }, { key: '18:30:00', value: 689 }, { key: '18:40:00', value: 682 }, { key: '18:50:00', value: 684 }, { key: '19:00:00', value: 689 }, { key: '19:10:00', value: 699 }, { key: '19:20:00', value: 694 }, { key: '19:30:00', value: 684 }, { key: '19:40:00', value: 670 }, { key: '19:50:00', value: 656 }, { key: '20:00:00', value: 660 }, { key: '20:10:00', value: 654 }, { key: '20:20:00', value: 650 }, { key: '20:30:00', value: 654 }, { key: '20:40:00', value: 656 }, { key: '20:50:00', value: 650 }, { key: '21:00:00', value: 672 }, { key: '21:10:00', value: 711 }, { key: '21:20:00', value: 746 }, { key: '21:30:00', value: 786 }, { key: '21:40:00', value: 802 }, { key: '21:50:00', value: 791 }, { key: '22:00:00', value: 787 }, { key: '22:10:00', value: 770 }, { key: '22:20:00', value: 773 }, { key: '22:30:00', value: 760 }, { key: '22:40:00', value: 755 }, { key: '22:50:00', value: 739 }, { key: '23:00:00', value: 749 }, { key: '23:10:00', value: 753 }, { key: '23:20:00', value: 754 }, { key: '23:30:00', value: 763 }, { key: '23:40:00', value: 779 }, { key: '23:50:00', value: 795 }]
	}, {
		key: '2016/6/2',
		values: [{ key: '0:00:00', value: 823 }, { key: '0:10:00', value: 845 }, { key: '0:20:00', value: 855 }, { key: '0:30:00', value: 860 }, { key: '0:40:00', value: 856 }, { key: '0:50:00', value: 849 }, { key: '1:00:00', value: 832 }, { key: '1:10:00', value: 831 }, { key: '1:20:00', value: 821 }, { key: '1:30:00', value: 804 }, { key: '1:40:00', value: 787 }, { key: '1:50:00', value: 779 }, { key: '2:00:00', value: 769 }, { key: '2:10:00', value: 757 }, { key: '2:20:00', value: 762 }, { key: '2:30:00', value: 760 }, { key: '2:40:00', value: 753 }, { key: '2:50:00', value: 756 }, { key: '3:00:00', value: 749 }, { key: '3:10:00', value: 743 }, { key: '3:20:00', value: 741 }, { key: '3:30:00', value: 736 }, { key: '3:40:00', value: 734 }, { key: '3:50:00', value: 733 }, { key: '4:00:00', value: 733 }, { key: '4:10:00', value: 724 }, { key: '4:20:00', value: 717 }, { key: '4:30:00', value: 729 }, { key: '4:40:00', value: 751 }, { key: '4:50:00', value: 784 }, { key: '5:00:00', value: 812 }, { key: '5:10:00', value: 834 }, { key: '5:20:00', value: 838 }, { key: '5:30:00', value: 838 }, { key: '5:40:00', value: 839 }, { key: '5:50:00', value: 841 }, { key: '6:00:00', value: 852 }, { key: '6:10:00', value: 865 }, { key: '6:20:00', value: 867 }, { key: '6:30:00', value: 867 }, { key: '6:40:00', value: 867 }, { key: '6:50:00', value: 865 }, { key: '7:00:00', value: 873 }, { key: '7:10:00', value: 876 }, { key: '7:20:00', value: 886 }, { key: '7:30:00', value: 907 }, { key: '7:40:00', value: 906 }, { key: '7:50:00', value: 884 }, { key: '8:00:00', value: 829 }, { key: '8:10:00', value: 813 }, { key: '8:20:00', value: 814 }, { key: '8:30:00', value: 816 }, { key: '8:40:00', value: 820 }, { key: '8:50:00', value: 823 }, { key: '9:00:00', value: 810 }, { key: '9:10:00', value: 786 }, { key: '9:20:00', value: 776 }, { key: '9:30:00', value: 769 }, { key: '9:40:00', value: 764 }, { key: '9:50:00', value: 757 }, { key: '10:00:00', value: 776 }, { key: '10:10:00', value: 795 }, { key: '10:20:00', value: 801 }, { key: '10:30:00', value: 780 }, { key: '10:40:00', value: 759 }, { key: '10:50:00', value: 706 }, { key: '11:00:00', value: 672 }, { key: '11:10:00', value: 678 }, { key: '11:20:00', value: 661 }, { key: '11:30:00', value: 620 }, { key: '11:40:00', value: 668 }, { key: '11:50:00', value: 710 }, { key: '12:00:00', value: 750 }, { key: '12:10:00', value: 773 }, { key: '12:20:00', value: 791 }, { key: '12:30:00', value: 813 }, { key: '12:40:00', value: 828 }, { key: '12:50:00', value: 844 }, { key: '13:00:00', value: 851 }, { key: '13:10:00', value: 858 }, { key: '13:20:00', value: 851 }, { key: '13:30:00', value: 843 }, { key: '13:40:00', value: 851 }, { key: '13:50:00', value: 846 }, { key: '14:00:00', value: 844 }, { key: '14:10:00', value: 843 }, { key: '14:20:00', value: 855 }, { key: '14:30:00', value: 850 }, { key: '14:40:00', value: 861 }, { key: '14:50:00', value: 855 }, { key: '15:00:00', value: 856 }, { key: '15:10:00', value: 868 }, { key: '15:20:00', value: 881 }, { key: '15:30:00', value: 879 }, { key: '15:40:00', value: 882 }, { key: '15:50:00', value: 883 }, { key: '16:00:00', value: 894 }, { key: '16:10:00', value: 912 }, { key: '16:20:00', value: 903 }, { key: '16:30:00', value: 882 }, { key: '16:40:00', value: 873 }, { key: '16:50:00', value: 837 }, { key: '17:00:00', value: 767 }, { key: '17:10:00', value: 750 }, { key: '17:20:00', value: 751 }, { key: '17:30:00', value: 746 }, { key: '17:40:00', value: 732 }, { key: '17:50:00', value: 724 }, { key: '18:00:00', value: 716 }, { key: '18:10:00', value: 724 }, { key: '18:20:00', value: 737 }, { key: '18:30:00', value: 741 }, { key: '18:40:00', value: 718 }, { key: '18:50:00', value: 723 }, { key: '19:00:00', value: 751 }, { key: '19:10:00', value: 763 }, { key: '19:20:00', value: 765 }, { key: '19:30:00', value: 779 }, { key: '19:40:00', value: 767 }, { key: '19:50:00', value: 767 }, { key: '20:00:00', value: 758 }, { key: '20:10:00', value: 740 }, { key: '20:20:00', value: 736 }, { key: '20:30:00', value: 736 }, { key: '20:40:00', value: 756 }, { key: '20:50:00', value: 766 }, { key: '21:00:00', value: 805 }, { key: '21:10:00', value: 847 }, { key: '21:20:00', value: 855 }, { key: '21:30:00', value: 859 }, { key: '21:40:00', value: 855 }, { key: '21:50:00', value: 859 }, { key: '22:00:00', value: 842 }, { key: '22:10:00', value: 816 }, { key: '22:20:00', value: 807 }, { key: '22:30:00', value: 790 }, { key: '22:40:00', value: 778 }, { key: '22:50:00', value: 754 }, { key: '23:00:00', value: 764 }, { key: '23:10:00', value: 784 }, { key: '23:20:00', value: 791 }, { key: '23:30:00', value: 802 }, { key: '23:40:00', value: 813 }, { key: '23:50:00', value: 838 }]
	}, {
		key: '2016/6/3',
		values: [{ key: '0:00:00', value: 872 }, { key: '0:10:00', value: 898 }, { key: '0:20:00', value: 895 }, { key: '0:30:00', value: 879 }, { key: '0:40:00', value: 872 }, { key: '0:50:00', value: 872 }, { key: '1:00:00', value: 866 }, { key: '1:10:00', value: 862 }, { key: '1:20:00', value: 853 }, { key: '1:30:00', value: 841 }, { key: '1:40:00', value: 838 }, { key: '1:50:00', value: 834 }, { key: '2:00:00', value: 832 }, { key: '2:10:00', value: 825 }, { key: '2:20:00', value: 828 }, { key: '2:30:00', value: 820 }, { key: '2:40:00', value: 815 }, { key: '2:50:00', value: 805 }, { key: '3:00:00', value: 800 }, { key: '3:10:00', value: 796 }, { key: '3:20:00', value: 794 }, { key: '3:30:00', value: 798 }, { key: '3:40:00', value: 798 }, { key: '3:50:00', value: 794 }, { key: '4:00:00', value: 800 }, { key: '4:10:00', value: 799 }, { key: '4:20:00', value: 807 }, { key: '4:30:00', value: 796 }, { key: '4:40:00', value: 812 }, { key: '4:50:00', value: 812 }, { key: '5:00:00', value: 834 }, { key: '5:10:00', value: 850 }, { key: '5:20:00', value: 861 }, { key: '5:30:00', value: 863 }, { key: '5:40:00', value: 862 }, { key: '5:50:00', value: 861 }, { key: '6:00:00', value: 866 }, { key: '6:10:00', value: 890 }, { key: '6:20:00', value: 883 }, { key: '6:30:00', value: 870 }, { key: '6:40:00', value: 851 }, { key: '6:50:00', value: 839 }, { key: '7:00:00', value: 854 }, { key: '7:10:00', value: 836 }, { key: '7:20:00', value: 837 }, { key: '7:30:00', value: 834 }, { key: '7:40:00', value: 806 }, { key: '7:50:00', value: 777 }, { key: '8:00:00', value: 754 }, { key: '8:10:00', value: 732 }, { key: '8:20:00', value: 725 }, { key: '8:30:00', value: 732 }, { key: '8:40:00', value: 730 }, { key: '8:50:00', value: 775 }, { key: '9:00:00', value: 866 }, { key: '9:10:00', value: 876 }, { key: '9:20:00', value: 875 }, { key: '9:30:00', value: 878 }, { key: '9:40:00', value: 885 }, { key: '9:50:00', value: 886 }, { key: '10:00:00', value: 893 }, { key: '10:10:00', value: 895 }, { key: '10:20:00', value: 883 }, { key: '10:30:00', value: 890 }, { key: '10:40:00', value: 880 }, { key: '10:50:00', value: 839 }, { key: '11:00:00', value: 768 }, { key: '11:10:00', value: 726 }, { key: '11:20:00', value: 699 }, { key: '11:30:00', value: 637 }, { key: '11:40:00', value: 639 }, { key: '11:50:00', value: 639 }, { key: '12:00:00', value: 661 }, { key: '12:10:00', value: 672 }, { key: '12:20:00', value: 704 }, { key: '12:30:00', value: 804 }, { key: '12:40:00', value: 829 }, { key: '12:50:00', value: 843 }, { key: '13:00:00', value: 850 }, { key: '13:10:00', value: 859 }, { key: '13:20:00', value: 862 }, { key: '13:30:00', value: 863 }, { key: '13:40:00', value: 861 }, { key: '13:50:00', value: 851 }, { key: '14:00:00', value: 853 }, { key: '14:10:00', value: 855 }, { key: '14:20:00', value: 856 }, { key: '14:30:00', value: 849 }, { key: '14:40:00', value: 853 }, { key: '14:50:00', value: 847 }, { key: '15:00:00', value: 848 }, { key: '15:10:00', value: 818 }, { key: '15:20:00', value: 765 }, { key: '15:30:00', value: 719 }, { key: '15:40:00', value: 690 }, { key: '15:50:00', value: 692 }, { key: '16:00:00', value: 701 }, { key: '16:10:00', value: 695 }, { key: '16:20:00', value: 697 }, { key: '16:30:00', value: 704 }, { key: '16:40:00', value: 703 }, { key: '16:50:00', value: 709 }, { key: '17:00:00', value: 691 }, { key: '17:10:00', value: 695 }, { key: '17:20:00', value: 690 }, { key: '17:30:00', value: 679 }, { key: '17:40:00', value: 682 }, { key: '17:50:00', value: 675 }, { key: '18:00:00', value: 645 }, { key: '18:10:00', value: 636 }, { key: '18:20:00', value: 633 }, { key: '18:30:00', value: 634 }, { key: '18:40:00', value: 648 }, { key: '18:50:00', value: 654 }, { key: '19:00:00', value: 673 }, { key: '19:10:00', value: 684 }, { key: '19:20:00', value: 685 }, { key: '19:30:00', value: 707 }, { key: '19:40:00', value: 743 }, { key: '19:50:00', value: 757 }, { key: '20:00:00', value: 767 }, { key: '20:10:00', value: 765 }, { key: '20:20:00', value: 754 }, { key: '20:30:00', value: 742 }, { key: '20:40:00', value: 733 }, { key: '20:50:00', value: 717 }, { key: '21:00:00', value: 738 }, { key: '21:10:00', value: 768 }, { key: '21:20:00', value: 777 }, { key: '21:30:00', value: 789 }, { key: '21:40:00', value: 810 }, { key: '21:50:00', value: 837 }, { key: '22:00:00', value: 843 }, { key: '22:10:00', value: 842 }, { key: '22:20:00', value: 847 }, { key: '22:30:00', value: 846 }, { key: '22:40:00', value: 839 }, { key: '22:50:00', value: 835 }, { key: '23:00:00', value: 833 }, { key: '23:10:00', value: 838 }, { key: '23:20:00', value: 842 }, { key: '23:30:00', value: 838 }, { key: '23:40:00', value: 845 }, { key: '23:50:00', value: 857 }]
	}, {
		key: '2016/6/4',
		values: [{ key: '0:00:00', value: 884 }, { key: '0:10:00', value: 895 }, { key: '0:20:00', value: 896 }, { key: '0:30:00', value: 890 }, { key: '0:40:00', value: 908 }, { key: '0:50:00', value: 910 }, { key: '1:00:00', value: 910 }, { key: '1:10:00', value: 902 }, { key: '1:20:00', value: 891 }, { key: '1:30:00', value: 893 }, { key: '1:40:00', value: 888 }, { key: '1:50:00', value: 878 }, { key: '2:00:00', value: 885 }, { key: '2:10:00', value: 880 }, { key: '2:20:00', value: 869 }, { key: '2:30:00', value: 879 }, { key: '2:40:00', value: 869 }, { key: '2:50:00', value: 868 }, { key: '3:00:00', value: 865 }, { key: '3:10:00', value: 860 }, { key: '3:20:00', value: 863 }, { key: '3:30:00', value: 853 }, { key: '3:40:00', value: 850 }, { key: '3:50:00', value: 850 }, { key: '4:00:00', value: 833 }, { key: '4:10:00', value: 834 }, { key: '4:20:00', value: 826 }, { key: '4:30:00', value: 824 }, { key: '4:40:00', value: 831 }, { key: '4:50:00', value: 837 }, { key: '5:00:00', value: 846 }, { key: '5:10:00', value: 860 }, { key: '5:20:00', value: 848 }, { key: '5:30:00', value: 848 }, { key: '5:40:00', value: 840 }, { key: '5:50:00', value: 840 }, { key: '6:00:00', value: 834 }, { key: '6:10:00', value: 837 }, { key: '6:20:00', value: 834 }, { key: '6:30:00', value: 839 }, { key: '6:40:00', value: 848 }, { key: '6:50:00', value: 858 }, { key: '7:00:00', value: 887 }, { key: '7:10:00', value: 894 }, { key: '7:20:00', value: 898 }, { key: '7:30:00', value: 906 }, { key: '7:40:00', value: 891 }, { key: '7:50:00', value: 872 }, { key: '8:00:00', value: 828 }, { key: '8:10:00', value: 838 }, { key: '8:20:00', value: 836 }, { key: '8:30:00', value: 838 }, { key: '8:40:00', value: 831 }, { key: '8:50:00', value: 832 }, { key: '9:00:00', value: 852 }, { key: '9:10:00', value: 851 }, { key: '9:20:00', value: 853 }, { key: '9:30:00', value: 846 }, { key: '9:40:00', value: 849 }, { key: '9:50:00', value: 850 }, { key: '10:00:00', value: 853 }, { key: '10:10:00', value: 861 }, { key: '10:20:00', value: 861 }, { key: '10:30:00', value: 859 }, { key: '10:40:00', value: 854 }, { key: '10:50:00', value: 828 }, { key: '11:00:00', value: 802 }, { key: '11:10:00', value: 784 }, { key: '11:20:00', value: 724 }, { key: '11:30:00', value: 632 }, { key: '11:40:00', value: 610 }, { key: '11:50:00', value: 597 }, { key: '12:00:00', value: 611 }, { key: '12:10:00', value: 637 }, { key: '12:20:00', value: 654 }, { key: '12:30:00', value: 670 }, { key: '12:40:00', value: 651 }, { key: '12:50:00', value: 654 }, { key: '13:00:00', value: 674 }, { key: '13:10:00', value: 689 }, { key: '13:20:00', value: 693 }, { key: '13:30:00', value: 693 }, { key: '13:40:00', value: 697 }, { key: '13:50:00', value: 693 }, { key: '14:00:00', value: 684 }, { key: '14:10:00', value: 672 }, { key: '14:20:00', value: 667 }, { key: '14:30:00', value: 663 }, { key: '14:40:00', value: 652 }, { key: '14:50:00', value: 649 }, { key: '15:00:00', value: 654 }, { key: '15:10:00', value: 642 }, { key: '15:20:00', value: 653 }, { key: '15:30:00', value: 657 }, { key: '15:40:00', value: 661 }, { key: '15:50:00', value: 666 }, { key: '16:00:00', value: 682 }, { key: '16:10:00', value: 682 }, { key: '16:20:00', value: 678 }, { key: '16:30:00', value: 695 }, { key: '16:40:00', value: 716 }, { key: '16:50:00', value: 705 }, { key: '17:00:00', value: 700 }, { key: '17:10:00', value: 708 }, { key: '17:20:00', value: 705 }, { key: '17:30:00', value: 705 }, { key: '17:40:00', value: 705 }, { key: '17:50:00', value: 705 }, { key: '18:00:00', value: 688 }, { key: '18:10:00', value: 682 }, { key: '18:20:00', value: 681 }, { key: '18:30:00', value: 683 }, { key: '18:40:00', value: 692 }, { key: '18:50:00', value: 696 }, { key: '19:00:00', value: 707 }, { key: '19:10:00', value: 729 }, { key: '19:20:00', value: 740 }, { key: '19:30:00', value: 748 }, { key: '19:40:00', value: 743 }, { key: '19:50:00', value: 729 }, { key: '20:00:00', value: 736 }, { key: '20:10:00', value: 748 }, { key: '20:20:00', value: 752 }, { key: '20:30:00', value: 743 }, { key: '20:40:00', value: 738 }, { key: '20:50:00', value: 742 }, { key: '21:00:00', value: 773 }, { key: '21:10:00', value: 807 }, { key: '21:20:00', value: 823 }, { key: '21:30:00', value: 829 }, { key: '21:40:00', value: 826 }, { key: '21:50:00', value: 815 }, { key: '22:00:00', value: 789 }, { key: '22:10:00', value: 776 }, { key: '22:20:00', value: 769 }, { key: '22:30:00', value: 751 }, { key: '22:40:00', value: 746 }, { key: '22:50:00', value: 741 }, { key: '23:00:00', value: 734 }, { key: '23:10:00', value: 740 }, { key: '23:20:00', value: 733 }, { key: '23:30:00', value: 730 }, { key: '23:40:00', value: 747 }, { key: '23:50:00', value: 758 }]
	}, {
		key: '2016/6/5',
		values: [{ key: '0:00:00', value: 797 }, { key: '0:10:00', value: 846 }, { key: '0:20:00', value: 856 }, { key: '0:30:00', value: 847 }, { key: '0:40:00', value: 853 }, { key: '0:50:00', value: 855 }, { key: '1:00:00', value: 858 }, { key: '1:10:00', value: 882 }, { key: '1:20:00', value: 881 }, { key: '1:30:00', value: 881 }, { key: '1:40:00', value: 864 }, { key: '1:50:00', value: 854 }, { key: '2:00:00', value: 851 }, { key: '2:10:00', value: 844 }, { key: '2:20:00', value: 843 }, { key: '2:30:00', value: 838 }, { key: '2:40:00', value: 828 }, { key: '2:50:00', value: 832 }, { key: '3:00:00', value: 826 }, { key: '3:10:00', value: 832 }, { key: '3:20:00', value: 831 }, { key: '3:30:00', value: 814 }, { key: '3:40:00', value: 815 }, { key: '3:50:00', value: 811 }, { key: '4:00:00', value: 807 }, { key: '4:10:00', value: 813 }, { key: '4:20:00', value: 820 }, { key: '4:30:00', value: 824 }, { key: '4:40:00', value: 827 }, { key: '4:50:00', value: 841 }, { key: '5:00:00', value: 854 }, { key: '5:10:00', value: 862 }, { key: '5:20:00', value: 845 }, { key: '5:30:00', value: 835 }, { key: '5:40:00', value: 837 }, { key: '5:50:00', value: 834 }, { key: '6:00:00', value: 861 }, { key: '6:10:00', value: 871 }, { key: '6:20:00', value: 860 }, { key: '6:30:00', value: 849 }, { key: '6:40:00', value: 841 }, { key: '6:50:00', value: 837 }, { key: '7:00:00', value: 840 }, { key: '7:10:00', value: 842 }, { key: '7:20:00', value: 850 }, { key: '7:30:00', value: 851 }, { key: '7:40:00', value: 837 }, { key: '7:50:00', value: 808 }, { key: '8:00:00', value: 733 }, { key: '8:10:00', value: 687 }, { key: '8:20:00', value: 651 }, { key: '8:30:00', value: 645 }, { key: '8:40:00', value: 623 }, { key: '8:50:00', value: 616 }, { key: '9:00:00', value: 617 }, { key: '9:10:00', value: 633 }, { key: '9:20:00', value: 640 }, { key: '9:30:00', value: 640 }, { key: '9:40:00', value: 648 }, { key: '9:50:00', value: 661 }, { key: '10:00:00', value: 667 }, { key: '10:10:00', value: 688 }, { key: '10:20:00', value: 694 }, { key: '10:30:00', value: 685 }, { key: '10:40:00', value: 679 }, { key: '10:50:00', value: 655 }, { key: '11:00:00', value: 626 }, { key: '11:10:00', value: 630 }, { key: '11:20:00', value: 608 }, { key: '11:30:00', value: 580 }, { key: '11:40:00', value: 565 }, { key: '11:50:00', value: 581 }, { key: '12:00:00', value: 603 }, { key: '12:10:00', value: 612 }, { key: '12:20:00', value: 630 }, { key: '12:30:00', value: 635 }, { key: '12:40:00', value: 628 }, { key: '12:50:00', value: 638 }, { key: '13:00:00', value: 643 }, { key: '13:10:00', value: 656 }, { key: '13:20:00', value: 658 }, { key: '13:30:00', value: 654 }, { key: '13:40:00', value: 649 }, { key: '13:50:00', value: 625 }, { key: '14:00:00', value: 618 }, { key: '14:10:00', value: 620 }, { key: '14:20:00', value: 619 }, { key: '14:30:00', value: 623 }, { key: '14:40:00', value: 626 }, { key: '14:50:00', value: 628 }, { key: '15:00:00', value: 638 }, { key: '15:10:00', value: 644 }, { key: '15:20:00', value: 642 }, { key: '15:30:00', value: 641 }, { key: '15:40:00', value: 652 }, { key: '15:50:00', value: 660 }, { key: '16:00:00', value: 682 }, { key: '16:10:00', value: 750 }, { key: '16:20:00', value: 814 }, { key: '16:30:00', value: 831 }, { key: '16:40:00', value: 848 }, { key: '16:50:00', value: 849 }, { key: '17:00:00', value: 841 }, { key: '17:10:00', value: 863 }, { key: '17:20:00', value: 864 }, { key: '17:30:00', value: 854 }, { key: '17:40:00', value: 850 }, { key: '17:50:00', value: 851 }, { key: '18:00:00', value: 853 }, { key: '18:10:00', value: 854 }, { key: '18:20:00', value: 850 }, { key: '18:30:00', value: 852 }, { key: '18:40:00', value: 854 }, { key: '18:50:00', value: 862 }, { key: '19:00:00', value: 869 }, { key: '19:10:00', value: 876 }, { key: '19:20:00', value: 882 }, { key: '19:30:00', value: 882 }, { key: '19:40:00', value: 875 }, { key: '19:50:00', value: 876 }, { key: '20:00:00', value: 873 }, { key: '20:10:00', value: 881 }, { key: '20:20:00', value: 882 }, { key: '20:30:00', value: 873 }, { key: '20:40:00', value: 873 }, { key: '20:50:00', value: 874 }, { key: '21:00:00', value: 905 }, { key: '21:10:00', value: 910 }, { key: '21:20:00', value: 909 }, { key: '21:30:00', value: 910 }, { key: '21:40:00', value: 905 }, { key: '21:50:00', value: 892 }, { key: '22:00:00', value: 880 }, { key: '22:10:00', value: 868 }, { key: '22:20:00', value: 856 }, { key: '22:30:00', value: 843 }, { key: '22:40:00', value: 835 }, { key: '22:50:00', value: 822 }, { key: '23:00:00', value: 811 }, { key: '23:10:00', value: 779 }, { key: '23:20:00', value: 731 }, { key: '23:30:00', value: 691 }, { key: '23:40:00', value: 685 }, { key: '23:50:00', value: 707 }]
	}, {
		key: '2016/6/6',
		values: [{ key: '0:00:00', value: 730 }, { key: '0:10:00', value: 759 }, { key: '0:20:00', value: 799 }, { key: '0:30:00', value: 806 }, { key: '0:40:00', value: 810 }, { key: '0:50:00', value: 813 }, { key: '1:00:00', value: 801 }, { key: '1:10:00', value: 804 }, { key: '1:20:00', value: 799 }, { key: '1:30:00', value: 841 }, { key: '1:40:00', value: 842 }, { key: '1:50:00', value: 850 }, { key: '2:00:00', value: 848 }, { key: '2:10:00', value: 851 }, { key: '2:20:00', value: 847 }, { key: '2:30:00', value: 837 }, { key: '2:40:00', value: 828 }, { key: '2:50:00', value: 823 }, { key: '3:00:00', value: 822 }, { key: '3:10:00', value: 816 }, { key: '3:20:00', value: 820 }, { key: '3:30:00', value: 823 }, { key: '3:40:00', value: 814 }, { key: '3:50:00', value: 816 }, { key: '4:00:00', value: 822 }, { key: '4:10:00', value: 828 }, { key: '4:20:00', value: 828 }, { key: '4:30:00', value: 829 }, { key: '4:40:00', value: 832 }, { key: '4:50:00', value: 846 }, { key: '5:00:00', value: 859 }, { key: '5:10:00', value: 866 }, { key: '5:20:00', value: 870 }, { key: '5:30:00', value: 870 }, { key: '5:40:00', value: 870 }, { key: '5:50:00', value: 864 }, { key: '6:00:00', value: 867 }, { key: '6:10:00', value: 866 }, { key: '6:20:00', value: 850 }, { key: '6:30:00', value: 847 }, { key: '6:40:00', value: 838 }, { key: '6:50:00', value: 831 }, { key: '7:00:00', value: 838 }, { key: '7:10:00', value: 836 }, { key: '7:20:00', value: 833 }, { key: '7:30:00', value: 837 }, { key: '7:40:00', value: 840 }, { key: '7:50:00', value: 833 }, { key: '8:00:00', value: 802 }, { key: '8:10:00', value: 809 }, { key: '8:20:00', value: 820 }, { key: '8:30:00', value: 823 }, { key: '8:40:00', value: 816 }, { key: '8:50:00', value: 807 }, { key: '9:00:00', value: 805 }, { key: '9:10:00', value: 813 }, { key: '9:20:00', value: 817 }, { key: '9:30:00', value: 818 }, { key: '9:40:00', value: 820 }, { key: '9:50:00', value: 824 }, { key: '10:00:00', value: 825 }, { key: '10:10:00', value: 833 }, { key: '10:20:00', value: 840 }, { key: '10:30:00', value: 843 }, { key: '10:40:00', value: 835 }, { key: '10:50:00', value: 828 }, { key: '11:00:00', value: 807 }, { key: '11:10:00', value: 806 }, { key: '11:20:00', value: 791 }, { key: '11:30:00', value: 763 }, { key: '11:40:00', value: 773 }, { key: '11:50:00', value: 768 }, { key: '12:00:00', value: 779 }, { key: '12:10:00', value: 791 }, { key: '12:20:00', value: 796 }, { key: '12:30:00', value: 800 }, { key: '12:40:00', value: 798 }, { key: '12:50:00', value: 800 }, { key: '13:00:00', value: 813 }, { key: '13:10:00', value: 809 }, { key: '13:20:00', value: 817 }, { key: '13:30:00', value: 820 }, { key: '13:40:00', value: 819 }, { key: '13:50:00', value: 816 }, { key: '14:00:00', value: 812 }, { key: '14:10:00', value: 814 }, { key: '14:20:00', value: 809 }, { key: '14:30:00', value: 819 }, { key: '14:40:00', value: 815 }, { key: '14:50:00', value: 807 }, { key: '15:00:00', value: 808 }, { key: '15:10:00', value: 811 }, { key: '15:20:00', value: 811 }, { key: '15:30:00', value: 811 }, { key: '15:40:00', value: 822 }, { key: '15:50:00', value: 819 }, { key: '16:00:00', value: 822 }, { key: '16:10:00', value: 829 }, { key: '16:20:00', value: 827 }, { key: '16:30:00', value: 818 }, { key: '16:40:00', value: 810 }, { key: '16:50:00', value: 822 }, { key: '17:00:00', value: 815 }, { key: '17:10:00', value: 828 }, { key: '17:20:00', value: 830 }, { key: '17:30:00', value: 820 }, { key: '17:40:00', value: 823 }, { key: '17:50:00', value: 823 }, { key: '18:00:00', value: 816 }, { key: '18:10:00', value: 810 }, { key: '18:20:00', value: 810 }, { key: '18:30:00', value: 810 }, { key: '18:40:00', value: 809 }, { key: '18:50:00', value: 822 }, { key: '19:00:00', value: 839 }, { key: '19:10:00', value: 761 }, { key: '19:20:00', value: 856 }, { key: '19:30:00', value: 861 }, { key: '19:40:00', value: 857 }, { key: '19:50:00', value: 847 }, { key: '20:00:00', value: 845 }, { key: '20:10:00', value: 847 }, { key: '20:20:00', value: 845 }, { key: '20:30:00', value:834 }, { key: '20:40:00', value: 830 }, { key: '20:50:00', value: 832 }, { key: '21:00:00', value: 851 }, { key: '21:10:00', value: 889 }, { key: '21:20:00', value: 894 }, { key: '21:30:00', value: 888 }, { key: '21:40:00', value: 885 }, { key: '21:50:00', value: 888 }, { key: '22:00:00', value: 875 }, { key: '22:10:00', value: 873 }, { key: '22:20:00', value: 877 }, { key: '22:30:00', value: 883 }, { key: '22:40:00', value: 877 }, { key: '22:50:00', value: 880 }, { key: '23:00:00', value: 886 }, { key: '23:10:00', value: 877 }, { key: '23:20:00', value: 875 }, { key: '23:30:00', value: 874 }, { key: '23:40:00', value: 881 }, { key: '23:50:00', value: 884 }]
	}, {
		key: '2016/6/7',
		values: [{ key: '0:00:00', value: 915 }, { key: '0:10:00', value: 949 }, { key: '0:20:00', value: 960 }, { key: '0:30:00', value: 971 }, { key: '0:40:00', value: 970 }, { key: '0:50:00', value: 966 }, { key: '1:00:00', value: 959 }, { key: '1:10:00', value: 959 }, { key: '1:20:00', value: 956 }, { key: '1:30:00', value: 950 }, { key: '1:40:00', value: 968 }, { key: '1:50:00', value: 951 }, { key: '2:00:00', value: 944 }, { key: '2:10:00', value: 943 }, { key: '2:20:00', value: 945 }, { key: '2:30:00', value: 943 }, { key: '2:40:00', value: 942 }, { key: '2:50:00', value: 938 }, { key: '3:00:00', value: 938 }, { key: '3:10:00', value: 937 }, { key: '3:20:00', value: 930 }, { key: '3:30:00', value: 931 }, { key: '3:40:00', value: 931 }, { key: '3:50:00', value: 934 }, { key: '4:00:00', value: 932 }, { key: '4:10:00', value: 933 }, { key: '4:20:00', value: 937 }, { key: '4:30:00', value: 946 }, { key: '4:40:00', value: 927 }, { key: '4:50:00', value: 927 }, { key: '5:00:00', value: 931 }, { key: '5:10:00', value: 951 }, { key: '5:20:00', value: 956 }, { key: '5:30:00', value: 959 }, { key: '5:40:00', value: 964 }, { key: '5:50:00', value: 967 }, { key: '6:00:00', value: 962 }, { key: '6:10:00', value: 960 }, { key: '6:20:00', value: 958 }, { key: '6:30:00', value: 959 }, { key: '6:40:00', value: 961 }, { key: '6:50:00', value: 953 }, { key: '7:00:00', value: 958 }, { key: '7:10:00', value: 965 }, { key: '7:20:00', value: 960 }, { key: '7:30:00', value: 952 }, { key: '7:40:00', value: 941 }, { key: '7:50:00', value: 923 }, { key: '8:00:00', value: 874 }, { key: '8:10:00', value: 876 }, { key: '8:20:00', value: 878 }, { key: '8:30:00', value: 893 }, { key: '8:40:00', value: 873 }, { key: '8:50:00', value: 885 }, { key: '9:00:00', value: 880 }, { key: '9:10:00', value: 886 }, { key: '9:20:00', value: 888 }, { key: '9:30:00', value: 890 }, { key: '9:40:00', value: 898 }, { key: '9:50:00', value: 906 }, { key: '10:00:00', value: 907 }, { key: '10:10:00', value: 925 }, { key: '10:20:00', value: 925 }, { key: '10:30:00', value: 921 }, { key: '10:40:00', value: 910 }, { key: '10:50:00', value: 879 }, { key: '11:00:00', value: 868 }, { key: '11:10:00', value: 889 }, { key: '11:20:00', value: 862 }, { key: '11:30:00', value: 836 }, { key: '11:40:00', value: 848 }, { key: '11:50:00', value: 858 }, { key: '12:00:00', value: 875 }, { key: '12:10:00', value: 887 }, { key: '12:20:00', value: 903 }, { key: '12:30:00', value: 916 }, { key: '12:40:00', value: 914 }, { key: '12:50:00', value: 900 }, { key: '13:00:00', value: 908 }, { key: '13:10:00', value: 919 }, { key: '13:20:00', value: 925 }, { key: '13:30:00', value: 930 }, { key: '13:40:00', value: 930 }, { key: '13:50:00', value: 916 }, { key: '14:00:00', value: 914 }, { key: '14:10:00', value: 926 }, { key: '14:20:00', value: 923 }, { key: '14:30:00', value: 914 }, { key: '14:40:00', value: 906 }, { key: '14:50:00', value: 900 }, { key: '15:00:00', value: 905 }, { key: '15:10:00', value: 911 }, { key: '15:20:00', value: 914 }, { key: '15:30:00', value: 919 }, { key: '15:40:00', value: 915 }, { key: '15:50:00', value: 915 }, { key: '16:00:00', value: 917 }, { key: '16:10:00', value: 929 }, { key: '16:20:00', value: 928 }, { key: '16:30:00', value: 918 }, { key: '16:40:00', value: 911 }, { key: '16:50:00', value: 904 }, { key: '17:00:00', value: 879 }, { key: '17:10:00', value: 887 }, { key: '17:20:00', value: 885 }, { key: '17:30:00', value: 882 }, { key: '17:40:00', value: 884 }, { key: '17:50:00', value: 872 }, { key: '18:00:00', value: 869 }, { key: '18:10:00', value: 872 }, { key: '18:20:00', value: 869 }, { key: '18:30:00', value: 869 }, { key: '18:40:00', value: 865 }, { key: '18:50:00', value: 874 }, { key: '19:00:00', value: 887 }, { key: '19:10:00', value: 900 }, { key: '19:20:00', value: 899 }, { key: '19:30:00', value: 903 }, { key: '19:40:00', value: 899 }, { key: '19:50:00', value: 892 }, { key: '20:00:00', value: 892 }, { key: '20:10:00', value: 883 }, { key: '20:20:00', value: 883 }, { key: '20:30:00', value: 875 }, { key: '20:40:00', value: 876 }, { key: '20:50:00', value: 876 }, { key: '21:00:00', value: 907 }, { key: '21:10:00', value: 939 }, { key: '21:20:00', value: 954 }, { key: '21:30:00', value: 953 }, { key: '21:40:00', value: 969 }, { key: '21:50:00', value: 968 }, { key: '22:00:00', value: 951 }, { key: '22:10:00', value: 947 }, { key: '22:20:00', value: 928 }, { key: '22:30:00', value: 920 }, { key: '22:40:00', value: 904 }, { key: '22:50:00', value: 893 }, { key: '23:00:00', value: 886 }, { key: '23:10:00', value: 882 }, { key: '23:20:00', value: 878 }, { key: '23:30:00', value: 873 }, { key: '23:40:00', value: 880 }, { key: '23:50:00', value: 892 }]
	}, {
		key: '2016/6/8',
		values: [{ key: '0:00:00', value: 926 }, { key: '0:10:00', value: 951 }, { key: '0:20:00', value: 977 }, { key: '0:30:00', value: 950 }, { key: '0:40:00', value: 954 }, { key: '0:50:00', value: 971 }, { key: '1:00:00', value: 965 }, { key: '1:10:00', value: 962 }, { key: '1:20:00', value: 961 }, { key: '1:30:00', value: 962 }, { key: '1:40:00', value: 961 }, { key: '1:50:00', value: 955 }, { key: '2:00:00', value: 950 }, { key: '2:10:00', value: 948 }, { key: '2:20:00', value: 947 }, { key: '2:30:00', value: 939 }, { key: '2:40:00', value: 939 }, { key: '2:50:00', value: 936 }, { key: '3:00:00', value: 931 }, { key: '3:10:00', value: 929 }, { key: '3:20:00', value: 929 }, { key: '3:30:00', value: 933 }, { key: '3:40:00', value: 929 }, { key: '3:50:00', value: 928 }, { key: '4:00:00', value: 927 }, { key: '4:10:00', value: 937 }, { key: '4:20:00', value: 936 }, { key: '4:30:00', value: 940 }, { key: '4:40:00', value: 944 }, { key: '4:50:00', value: 949 }, { key: '5:00:00', value: 945 }, { key: '5:10:00', value: 927 }, { key: '5:20:00', value: 940 }, { key: '5:30:00', value: 947 }, { key: '5:40:00', value: 953 }, { key: '5:50:00', value: 950 }, { key: '6:00:00', value: 950 }, { key: '6:10:00', value: 944 }, { key: '6:20:00', value: 945 }, { key: '6:30:00', value: 945 }, { key: '6:40:00', value: 945 }, { key: '6:50:00', value: 944 }, { key: '7:00:00', value: 944 }, { key: '7:10:00', value: 945 }, { key: '7:20:00', value: 944 }, { key: '7:30:00', value: 962 }, { key: '7:40:00', value: 942 }, { key: '7:50:00', value: 926 }, { key: '8:00:00', value: 874 }, { key: '8:10:00', value: 879 }, { key: '8:20:00', value: 898 }, { key: '8:30:00', value: 912 }, { key: '8:40:00', value: 922 }, { key: '8:50:00', value: 950 }, { key: '9:00:00', value: 958 }, { key: '9:10:00', value: 957 }, { key: '9:20:00', value: 960 }, { key: '9:30:00', value: 954 }, { key: '9:40:00', value: 961 }, { key: '9:50:00', value: 963 }, { key: '10:00:00', value: 955 }, { key: '10:10:00', value: 921 }, { key: '10:20:00', value: 939 }, { key: '10:30:00', value: 985 }, { key: '10:40:00', value: 984 }, { key: '10:50:00', value: 931 }, { key: '11:00:00', value: 870 }, { key: '11:10:00', value: 856 }, { key: '11:20:00', value: 841 }, { key: '11:30:00', value: 807 }, { key: '11:40:00', value: 817 }, { key: '11:50:00', value: 822 }, { key: '12:00:00', value: 839 }, { key: '12:10:00', value: 856 }, { key: '12:20:00', value: 869 }, { key: '12:30:00', value: 902 }, { key: '12:40:00', value: 914 }, { key: '12:50:00', value: 903 }, { key: '13:00:00', value: 917 }, { key: '13:10:00', value: 949 }, { key: '13:20:00', value: 962 }, { key: '13:30:00', value: 956 }, { key: '13:40:00', value: 943 }, { key: '13:50:00', value: 926 }, { key: '14:00:00', value: 912 }, { key: '14:10:00', value: 912 }, { key: '14:20:00', value: 906 }, { key: '14:30:00', value: 888 }, { key: '14:40:00', value: 878 }, { key: '14:50:00', value: 869 }, { key: '15:00:00', value: 867 }, { key: '15:10:00', value: 872 }, { key: '15:20:00', value: 874 }, { key: '15:30:00', value: 902 }, { key: '15:40:00', value: 926 }, { key: '15:50:00', value: 933 }, { key: '16:00:00', value: 938 }, { key: '16:10:00', value: 937 }, { key: '16:20:00', value: 933 }, { key: '16:30:00', value: 930 }, { key: '16:40:00', value: 927 }, { key: '16:50:00', value: 927 }, { key: '17:00:00', value: 909 }, { key: '17:10:00', value: 917 }, { key: '17:20:00', value: 909 }, { key: '17:30:00', value: 908 }, { key: '17:40:00', value: 906 }, { key: '17:50:00', value: 902 }, { key: '18:00:00', value: 900 }, { key: '18:10:00', value: 903 }, { key: '18:20:00', value: 907 }, { key: '18:30:00', value: 906 }, { key: '18:40:00', value: 906 }, { key: '18:50:00', value: 910 }, { key: '19:00:00', value: 918 }, { key: '19:10:00', value: 928 }, { key: '19:20:00', value: 927 }, { key: '19:30:00', value: 932 }, { key: '19:40:00', value: 927 }, { key: '19:50:00', value: 925 }, { key: '20:00:00', value: 927 }, { key: '20:10:00', value: 925 }, { key: '20:20:00', value: 927 }, { key: '20:30:00', value: 923 }, { key: '20:40:00', value: 932 }, { key: '20:50:00', value: 933 }, { key: '21:00:00', value: 949 }, { key: '21:10:00', value: 967 }, { key: '21:20:00', value: 971 }, { key: '21:30:00', value: 972 }, { key: '21:40:00', value: 977 }, { key: '21:50:00', value: 982 }, { key: '22:00:00', value: 986 }, { key: '22:10:00', value: 979 }, { key: '22:20:00', value: 971 }, { key: '22:30:00', value: 961 }, { key: '22:40:00', value: 952 }, { key: '22:50:00', value: 946 }, { key: '23:00:00', value: 944 }, { key: '23:10:00', value: 942 }, { key: '23:20:00', value: 936}, { key: '23:30:00', value: 936 }, { key: '23:40:00', value: 945 }, { key: '23:50:00', value: 948 }]
	}, {
		key: '2016/6/9',
		values: [{ key: '0:00:00', value: 968 }, { key: '0:10:00', value: 985 }, { key: '0:20:00', value: 994 }, { key: '0:30:00', value: 995 }, { key: '0:40:00', value: 988 }, { key: '0:50:00', value: 983 }, { key: '1:00:00', value: 980 }, { key: '1:10:00', value: 972 }, { key: '1:20:00', value: 971 }, { key: '1:30:00', value: 965 }, { key: '1:40:00', value: 963 }, { key: '1:50:00', value: 959 }, { key: '2:00:00', value: 957 }, { key: '2:10:00', value: 953 }, { key: '2:20:00', value: 946 }, { key: '2:30:00', value: 944 }, { key: '2:40:00', value: 948 }, { key: '2:50:00', value: 942 }, { key: '3:00:00', value: 936 }, { key: '3:10:00', value: 943 }, { key: '3:20:00', value: 939 }, { key: '3:30:00', value: 940 }, { key: '3:40:00', value: 938 }, { key: '3:50:00', value: 933 }, { key: '4:00:00', value: 939 }, { key: '4:10:00', value: 938 }, { key: '4:20:00', value: 933 }, { key: '4:30:00', value: 939 }, { key: '4:40:00', value: 939 }, { key: '4:50:00', value: 948 }, { key: '5:00:00', value: 955 }, { key: '5:10:00', value: 964 }, { key: '5:20:00', value: 969 }, { key: '5:30:00', value: 968 }, { key: '5:40:00', value: 963 }, { key: '5:50:00', value: 964 }, { key: '6:00:00', value: 965 }, { key: '6:10:00', value: 961 }, { key: '6:20:00', value: 957 }, { key: '6:30:00', value: 955 }, { key: '6:40:00', value: 946 }, { key: '6:50:00', value: 937 }, { key: '7:00:00', value: 892 }, { key: '7:10:00', value: 869 }, { key: '7:20:00', value: 849 }, { key: '7:30:00', value: 859 }, { key: '7:40:00', value: 885 }, { key: '7:50:00', value: 873 }, { key: '8:00:00', value: 782 }, { key: '8:10:00', value: 744 }, { key: '8:20:00', value: 757 }, { key: '8:30:00', value: 736 }, { key: '8:40:00', value: 715 }, { key: '8:50:00', value: 699 }, { key: '9:00:00', value: 692 }, { key: '9:10:00', value: 696 }, { key: '9:20:00', value: 683 }, { key: '9:30:00', value: 680 }, { key: '9:40:00', value: 677 }, { key: '9:50:00', value: 660 }, { key: '10:00:00', value: 669 }, { key: '10:10:00', value: 672 }, { key: '10:20:00', value: 679 }, { key: '10:30:00', value: 676 }, { key: '10:40:00', value: 669 }, { key: '10:50:00', value: 660 }, { key: '11:00:00', value: 653 }, { key: '11:10:00', value: 655 }, { key: '11:20:00', value: 648 }, { key: '11:30:00', value: 642 }, { key: '11:40:00', value: 642 }, { key: '11:50:00', value: 633 }, { key: '12:00:00', value: 638 }, { key:'12:10:00', value: 640 }, { key: '12:20:00', value: 643 }, { key: '12:30:00', value: 649 }, { key: '12:40:00', value: 646 }, { key: '12:50:00', value: 645 }, { key: '13:00:00', value: 644 }, { key: '13:10:00', value: 645 }, { key: '13:20:00', value: 649 }, { key: '13:30:00', value: 645 }, { key: '13:40:00', value: 649 }, { key: '13:50:00', value: 648 }, { key: '14:00:00', value: 644 }, { key: '14:10:00', value: 636 }, { key: '14:20:00', value: 639 }, { key: '14:30:00', value: 642 }, { key: '14:40:00', value: 641 }, { key: '14:50:00', value: 643 }, { key: '15:00:00', value: 648 }, { key: '15:10:00', value: 648 }, { key: '15:20:00', value: 650 }, { key: '15:30:00', value: 642 }, { key: '15:40:00', value: 656 }, { key: '15:50:00', value: 658 }, { key: '16:00:00', value: 665 }, { key: '16:10:00', value: 678 }, { key: '16:20:00', value: 679 }, { key: '16:30:00', value: 685 }, { key: '16:40:00', value: 686 }, { key: '16:50:00', value: 668 }, { key: '17:00:00', value: 674 }, { key: '17:10:00', value: 667 }, { key: '17:20:00', value: 668 }, { key: '17:30:00', value: 669 }, { key: '17:40:00', value: 666 }, { key: '17:50:00', value: 662 }, { key: '18:00:00', value: 665 }, { key: '18:10:00', value: 663 }, { key: '18:20:00', value: 671 }, { key: '18:30:00', value: 679 }, { key: '18:40:00', value: 675 }, { key: '18:50:00', value: 668 }, { key: '19:00:00', value: 662 }, { key: '19:10:00', value: 667 }, { key: '19:20:00', value: 679 }, { key: '19:30:00', value: 692 }, { key: '19:40:00', value: 693 }, { key: '19:50:00', value: 699 }, { key: '20:00:00', value: 703 }, { key: '20:10:00', value: 700 }, { key: '20:20:00', value: 706 }, { key: '20:30:00', value: 699 }, { key: '20:40:00', value: 708 }, { key: '20:50:00', value: 717 }, { key: '21:00:00', value: 739 }, { key: '21:10:00', value: 771 }, { key: '21:20:00', value: 784 }, { key: '21:30:00', value: 785 }, { key: '21:40:00', value: 784 }, { key: '21:50:00', value: 776 }, { key: '22:00:00', value: 759 }, { key: '22:10:00', value: 744 }, { key: '22:20:00', value: 737 }, { key: '22:30:00', value: 718 }, { key: '22:40:00', value: 711 }, { key: '22:50:00', value: 707 }, { key: '23:00:00', value: 692 }, { key: '23:10:00', value: 680 }, { key: '23:20:00', value: 684 }, { key: '23:30:00', value: 685 }, { key: '23:40:00', value: 691 }, { key: '23:50:00', value: 704 }]
	}, {
		key: '2016/6/10',
		values: [{ key: '0:00:00', value: 735 }, { key: '0:10:00', value: 756 }, { key: '0:20:00', value: 757 }, { key: '0:30:00', value: 758 }, { key: '0:40:00', value: 779 }, { key: '0:50:00', value: 778 }, { key: '1:00:00', value: 779 }, { key: '1:10:00', value: 787 }, { key: '1:20:00', value: 780 }, { key: '1:30:00', value: 775 }, { key: '1:40:00', value: 772 }, { key: '1:50:00', value: 775 }, { key: '2:00:00', value: 773 }, { key: '2:10:00', value: 774 }, { key: '2:20:00', value: 775 }, { key: '2:30:00', value: 771 }, { key: '2:40:00', value: 763 }, { key: '2:50:00', value: 767 }, { key: '3:00:00', value: 762 }, { key: '3:10:00', value: 759 }, { key: '3:20:00', value: 751 }, { key: '3:30:00', value: 753 }, { key: '3:40:00', value: 755 }, { key: '3:50:00', value: 752 }, { key: '4:00:00', value: 758 }, { key: '4:10:00', value: 766 }, { key: '4:20:00', value: 769 }, { key: '4:30:00', value: 772 }, { key: '4:40:00', value: 776 }, { key: '4:50:00', value: 795 }, { key: '5:00:00', value: 822 }, { key: '5:10:00', value: 838 }, { key: '5:20:00', value: 831 }, { key: '5:30:00', value: 845 }, { key: '5:40:00', value: 845 }, { key: '5:50:00', value: 846 }, { key: '6:00:00', value: 833 }, { key: '6:10:00', value: 810 }, { key: '6:20:00', value: 813 }, { key: '6:30:00', value: 813 }, { key: '6:40:00', value: 809 }, { key: '6:50:00', value: 813 }, { key: '7:00:00', value: 826 }, { key: '7:10:00', value: 834 }, { key: '7:20:00', value: 843 }, { key: '7:30:00', value: 870 }, { key: '7:40:00', value: 876 }, { key: '7:50:00', value: 847 }, { key: '8:00:00', value: 790 }, { key: '8:10:00', value: 778 }, { key: '8:20:00', value: 783 }, { key: '8:30:00', value: 792 }, { key: '8:40:00', value: 798 }, { key: '8:50:00', value: 805 }, { key: '9:00:00', value: 803 }, { key: '9:10:00', value: 805 }, { key: '9:20:00', value: 810 }, { key: '9:30:00', value: 812 }, { key: '9:40:00', value: 822 }, { key: '9:50:00', value: 846 }, { key: '10:00:00', value: 848 }, { key: '10:10:00', value: 876 }, { key: '10:20:00', value: 884 }, { key: '10:30:00', value: 882 }, { key: '10:40:00', value: 875 }, { key: '10:50:00', value: 873 }, { key: '11:00:00', value: 847 }, { key: '11:10:00', value: 841 }, { key: '11:20:00', value: 825 }, { key: '11:30:00', value: 788 }, { key: '11:40:00', value: 792 }, { key: '11:50:00', value: 800 }, { key: '12:00:00', value: 830 }, { key: '12:10:00', value: 851 }, { key: '12:20:00', value: 862 }, { key: '12:30:00', value: 875 }, { key: '12:40:00', value: 888 }, { key: '12:50:00', value: 892 }, { key: '13:00:00', value: 898 }, { key: '13:10:00', value: 872}, { key: '13:20:00', value: 871 }, { key: '13:30:00', value: 862 }, { key: '13:40:00', value: 850 }, { key: '13:50:00', value: 839 }, { key: '14:00:00', value: 827 }, { key: '14:10:00', value: 822 }, { key: '14:20:00', value: 830 }, { key: '14:30:00', value: 830 }, { key: '14:40:00', value: 824 }, { key: '14:50:00', value: 828 }, { key: '15:00:00', value: 833 }, { key: '15:10:00', value: 832 }, { key: '15:20:00', value: 833 }, { key: '15:30:00', value: 831 }, { key: '15:40:00', value: 839 }, { key: '15:50:00', value: 841 }, { key: '16:00:00', value: 858 }, { key: '16:10:00', value: 857 }, { key: '16:20:00', value: 862 }, { key: '16:30:00', value: 871 }, { key: '16:40:00', value: 880 }, { key: '16:50:00', value: 881 }, { key: '17:00:00', value: 855 }, { key: '17:10:00', value: 859 }, { key: '17:20:00', value: 853 }, { key: '17:30:00', value: 848 }, { key: '17:40:00', value: 845 }, { key: '17:50:00', value: 840 }, { key: '18:00:00', value: 834 }, { key: '18:10:00', value: 835 }, { key: '18:20:00', value: 836 }, { key: '18:30:00', value: 842 }, { key: '18:40:00', value: 853 }, { key: '18:50:00', value: 847 }, { key: '19:00:00', value: 862 }, { key: '19:10:00', value: 891 }, { key: '19:20:00', value: 911 }, { key: '19:30:00', value: 927 }, { key: '19:40:00', value: 920 }, { key: '19:50:00', value: 918 }, { key: '20:00:00', value: 905 }, { key: '20:10:00', value: 906 }, { key: '20:20:00', value: 906}, { key: '20:30:00', value: 876 }, { key: '20:40:00', value: 856 }, { key: '20:50:00', value: 848 }, { key: '21:00:00', value: 871 }, { key: '21:10:00', value: 884 }, { key: '21:20:00', value: 901 }, { key: '21:30:00', value: 909 }, { key: '21:40:00', value: 889 }, { key: '21:50:00', value: 864 }, { key: '22:00:00', value: 828 }, { key: '22:10:00', value: 800 }, { key: '22:20:00', value: 801 }, { key: '22:30:00', value: 778 }, { key: '22:40:00', value: 762 }, { key: '22:50:00', value: 754 }, { key: '23:00:00', value: 744 }, { key: '23:10:00', value: 738 }, { key: '23:20:00', value: 735 }, { key: '23:30:00', value: 739 }, { key: '23:40:00', value: 756 }, { key: '23:50:00', value: 787 }]
	}, {
		key: '2016/6/11',
		values: [{ key: '0:00:00', value: 839 }, { key: '0:10:00', value: 871 }, { key: '0:20:00', value: 895 }, { key: '0:30:00', value: 900 }, { key: '0:40:00', value: 904 }, { key: '0:50:00', value: 907 }, { key: '1:00:00', value: 814 }, { key: '1:10:00', value: 912 }, { key: '1:20:00', value: 912 }, { key: '1:30:00', value: 909 }, { key: '1:40:00', value: 902 }, { key: '1:50:00', value: 896 }, { key: '2:00:00', value: 899 }, { key: '2:10:00', value: 900 }, { key: '2:20:00', value: 896 }, { key: '2:30:00', value: 884 }, { key: '2:40:00', value: 876 }, { key: '2:50:00', value: 874 }, { key: '3:00:00', value: 874 }, { key: '3:10:00', value: 870 }, { key: '3:20:00', value: 874 }, { key: '3:30:00', value: 873 }, { key: '3:40:00', value: 863 }, { key: '3:50:00', value: 868 }, { key: '4:00:00', value: 869 }, { key: '4:10:00', value: 863 }, { key: '4:20:00', value: 871 }, { key: '4:30:00', value: 873 }, { key: '4:40:00', value: 884 }, { key: '4:50:00', value: 892 }, { key: '5:00:00', value: 903 }, { key: '5:10:00', value: 910 }, { key: '5:20:00', value: 912 }, { key: '5:30:00', value: 920 }, { key: '5:40:00', value: 930 }, { key: '5:50:00', value: 925 }, { key: '6:00:00', value: 913 }, { key: '6:10:00', value: 915 }, { key: '6:20:00', value: 917 }, { key: '6:30:00', value: 915 }, { key: '6:40:00', value: 908 }, { key: '6:50:00', value: 908 }, { key: '7:00:00', value: 917 }, { key: '7:10:00', value: 928 }, { key: '7:20:00', value: 940 }, { key: '7:30:00', value: 968 }, { key: '7:40:00', value: 976 }, { key: '7:50:00', value: 966 }, { key: '8:00:00', value: 894 }, { key: '8:10:00', value: 894 }, { key: '8:20:00', value: 924 }, { key: '8:30:00', value: 927 }, { key: '8:40:00', value: 911 }, { key: '8:50:00', value: 905 }, { key: '9:00:00', value: 916 }, { key: '9:10:00', value: 921 }, { key: '9:20:00', value: 913 }, { key: '9:30:00', value: 920 }, { key: '9:40:00', value: 941 }, { key: '9:50:00', value: 916 }, { key: '10:00:00', value: 840 }, { key: '10:10:00', value: 831 }, { key: '10:20:00', value: 831 }, { key: '10:30:00', value: 808 }, { key: '10:40:00', value: 791 }, { key: '10:50:00', value: 787 }, { key: '11:00:00', value: 791 }, { key: '11:10:00', value: 790 }, { key: '11:20:00', value: 791 }, { key: '11:30:00', value: 791 }, { key: '11:40:00', value: 790 }, { key: '11:50:00', value: 790 }, { key: '12:00:00', value: 791 }, { key: '12:10:00', value: 792 }, { key: '12:20:00', value: 810 }, { key: '12:30:00', value: 819 }, { key: '12:40:00', value: 819 }, { key: '12:50:00', value: 855 }, { key: '13:00:00', value: 874 }, { key: '13:10:00', value: 903}, { key: '13:20:00', value: 939 }, { key: '13:30:00', value: 951 }, { key: '13:40:00', value: 960 }, { key: '13:50:00', value: 958 }, { key: '14:00:00', value: 959 }, { key: '14:10:00', value: 958 }, { key: '14:20:00', value: 958 }, { key: '14:30:00', value: 958 }, { key: '14:40:00', value: 953 }, { key: '14:50:00', value: 927 }, { key: '15:00:00', value: 933 }, { key: '15:10:00', value: 941 }, { key: '15:20:00', value: 942 }, { key: '15:30:00', value: 941 }, { key: '15:40:00', value: 941 }, { key: '15:50:00', value: 841 }, { key: '16:00:00', value: 858 }, { key: '16:10:00', value: 857 }, { key: '16:20:00', value: 956 }, { key: '16:30:00', value: 951 }, { key: '16:40:00', value: 958 }, { key: '16:50:00', value: 962 }, { key: '17:00:00', value: 927 }, { key: '17:10:00', value: 905 }, { key: '17:20:00', value: 878 }, { key: '17:30:00', value: 873 }, { key: '17:40:00', value: 869 }, { key: '17:50:00', value: 860 }, { key: '18:00:00', value: 854 }, { key: '18:10:00', value: 849 }, { key: '18:20:00', value: 846 }, { key: '18:30:00', value: 849 }, { key: '18:40:00', value: 857 }, { key: '18:50:00', value: 862 }, { key: '19:00:00', value: 874 }, { key: '19:10:00', value: 894 }, { key: '19:20:00', value: 909 }, { key: '19:30:00', value: 909 }, { key: '19:40:00', value: 906 }, { key: '19:50:00', value: 898 }, { key: '20:00:00', value: 891 }, { key: '20:10:00', value: 892 }, { key: '20:20:00', value: 890 }, { key: '20:30:00', value: 883 }, { key: '20:40:00', value: 885 }, { key: '20:50:00', value: 876 }, { key: '21:00:00', value: 902 }, { key: '21:10:00', value: 935 }, { key: '21:20:00', value: 942 }, { key: '21:30:00', value: 928 }, { key: '21:40:00', value: 894 }, { key: '21:50:00', value: 865 }, { key: '22:00:00', value: 836 }, { key: '22:10:00', value: 832 }, { key: '22:20:00', value: 834 }, { key: '22:30:00', value: 833 }, { key: '22:40:00', value: 823 }, { key: '22:50:00', value: 810 }, { key: '23:00:00', value: 801 }, { key: '23:10:00', value: 797 }, { key: '23:20:00', value: 790 }, { key: '23:30:00', value: 806 }, { key: '23:40:00', value: 811 }, { key: '23:50:00', value: 820 }]
	}, {
		key: '2016/6/12',
		values: [{ key: '0:00:00', value: 848 }, { key: '0:10:00', value: 864 }, { key: '0:20:00', value: 866 }, { key: '0:30:00', value: 871 }, { key: '0:40:00', value: 871 }, { key: '0:50:00', value: 873 }, { key: '1:00:00', value: 880 }, { key: '1:10:00', value: 882 }, { key: '1:20:00', value: 881 }, { key: '1:30:00', value: 875 }, { key: '1:40:00', value: 875 }, { key: '1:50:00', value: 876 }, { key: '2:00:00', value: 874 }, { key: '2:10:00', value: 880 }, { key: '2:20:00', value: 867 }, { key: '2:30:00', value: 869 }, { key: '2:40:00', value: 863 }, { key: '2:50:00', value: 854 }, { key: '3:00:00', value: 846 }, { key: '3:10:00', value: 848 }, { key: '3:20:00', value: 835 }, { key: '3:30:00', value: 835 }, { key: '3:40:00', value: 836 }, { key: '3:50:00', value: 834 }, { key: '4:00:00', value: 833 }, { key: '4:10:00', value: 834 }, { key: '4:20:00', value: 834 }, { key: '4:30:00', value: 836 }, { key: '4:40:00', value: 835 }, { key: '4:50:00', value: 843 }, { key: '5:00:00', value: 857 }, { key: '5:10:00', value: 868 }, { key: '5:20:00', value: 867 }, { key: '5:30:00', value: 868 }, { key: '5:40:00', value: 873 }, { key: '5:50:00', value: 872 }, { key: '6:00:00', value: 862 }, { key: '6:10:00', value: 862 }, { key: '6:20:00', value: 853 }, { key: '6:30:00', value: 852 }, { key: '6:40:00', value: 852 }, { key: '6:50:00', value: 848 }, { key: '7:00:00', value: 865 }, { key: '7:10:00', value: 870 }, { key: '7:20:00', value: 869 }, { key: '7:30:00', value: 885 }, { key: '7:40:00', value: 874 }, { key: '7:50:00', value: 861 }, { key: '8:00:00', value: 834 }, { key: '8:10:00', value: 822 }, { key: '8:20:00', value: 832 }, { key: '8:30:00', value: 832 }, { key: '8:40:00', value: 836 }, { key: '8:50:00', value: 831 }, { key: '9:00:00', value: 841 }, { key: '9:10:00', value: 842 }, { key: '9:20:00', value: 850 }, { key: '9:30:00', value: 850 }, { key: '9:40:00', value: 852 }, { key: '9:50:00', value: 855 }, { key: '10:00:00', value: 859 }, { key: '10:10:00', value: 860 }, { key: '10:20:00', value: 867 }, { key: '10:30:00', value: 856 }, { key: '10:40:00', value: 846 }, { key: '10:50:00', value: 820 }, { key: '11:00:00', value: 802 }, { key: '11:10:00', value: 786 }, { key: '11:20:00', value: 766 }, { key: '11:30:00', value: 728 }, { key: '11:40:00', value: 735 }, { key: '11:50:00', value: 743 }, { key: '12:00:00', value: 760 }, { key: '12:10:00', value: 780 }, { key: '12:20:00', value: 784 }, { key: '12:30:00', value: 786 }, { key: '12:40:00', value: 795 }, { key: '12:50:00', value: 784 }, { key: '13:00:00', value: 800 }, { key: '13:10:00', value: 823}, { key: '13:20:00', value: 846 }, { key: '13:30:00', value: 855 }, { key: '13:40:00', value: 855 }, { key: '13:50:00', value: 852 }, { key: '14:00:00', value: 857 }, { key: '14:10:00', value: 854 }, { key: '14:20:00', value: 857 }, { key: '14:30:00', value: 848 }, { key: '14:40:00', value: 851 }, { key: '14:50:00', value: 846 }, { key: '15:00:00', value: 845 }, { key: '15:10:00', value: 853 }, { key: '15:20:00', value: 855 }, { key: '15:30:00', value: 844 }, { key: '15:40:00', value: 845 }, { key: '15:50:00', value: 853 }, { key: '16:00:00', value: 864 }, { key: '16:10:00', value: 864 }, { key: '16:20:00', value: 865 }, { key: '16:30:00', value: 860 }, { key: '16:40:00', value: 847 }, { key: '16:50:00', value: 844 }, { key: '17:00:00', value: 822 }, { key: '17:10:00', value: 829 }, { key: '17:20:00', value: 815 }, { key: '17:30:00', value: 803 }, { key: '17:40:00', value: 813 }, { key: '17:50:00', value: 801 }, { key: '18:00:00', value: 791 }, { key: '18:10:00', value: 789 }, { key: '18:20:00', value: 789 }, { key: '18:30:00', value: 787 }, { key: '18:40:00', value: 783 }, { key: '18:50:00', value: 784 }, { key: '19:00:00', value: 788 }, { key: '19:10:00', value: 812 }, { key: '19:20:00', value: 828 }, { key: '19:30:00', value: 840 }, { key: '19:40:00', value: 829 }, { key: '19:50:00', value: 823 }, { key: '20:00:00', value: 817 }, { key: '20:10:00', value: 813 }, { key: '20:20:00', value: 813 }, { key: '20:30:00', value: 802 }, { key: '20:40:00', value: 801 }, { key: '20:50:00', value: 801 }, { key: '21:00:00', value: 839 }, { key: '21:10:00', value: 876 }, { key: '21:20:00', value: 893 }, { key: '21:30:00', value: 903 }, { key: '21:40:00', value: 910 }, { key: '21:50:00', value: 903 }, { key: '22:00:00', value: 897 }, { key: '22:10:00', value: 859 }, { key: '22:20:00', value: 842 }, { key: '22:30:00', value: 824 }, { key: '22:40:00', value: 809 }, { key: '22:50:00', value: 798 }, { key: '23:00:00', value: 794 }, { key: '23:10:00', value: 796 }, { key: '23:20:00', value: 791 }, { key: '23:30:00', value: 798 }, { key: '23:40:00', value: 805 }, { key: '23:50:00', value: 807 }]
	}, {
		key: '2016/6/13',
		values: [{ key: '0:00:00', value: 841 }, { key: '0:10:00', value: 871 }, { key: '0:20:00', value: 913 }, { key: '0:30:00', value: 930 }, { key: '0:40:00', value: 937 }, { key: '0:50:00', value: 930 }, { key: '1:00:00', value: 944 }, { key: '1:10:00', value: 953 }, { key: '1:20:00', value: 947 }, { key: '1:30:00', value: 943 }, { key: '1:40:00', value: 942 }, { key: '1:50:00', value: 943 }, { key: '2:00:00', value: 940 }, { key: '2:10:00', value: 939 }, { key: '2:20:00', value: 935 }, { key: '2:30:00', value: 930 }, { key: '2:40:00', value: 927 }, { key: '2:50:00', value: 927 }, { key: '3:00:00', value: 919 }, { key: '3:10:00', value: 918 }, { key: '3:20:00', value: 917 }, { key: '3:30:00', value: 915 }, { key: '3:40:00', value: 919 }, { key: '3:50:00', value: 916 }, { key: '4:00:00', value: 916 }, { key: '4:10:00', value: 918 }, { key: '4:20:00', value: 926 }, { key: '4:30:00', value: 924 }, { key: '4:40:00', value: 922 }, { key: '4:50:00', value: 937 }, { key: '5:00:00', value: 944 }, { key: '5:10:00', value: 947 }, { key: '5:20:00', value: 951 }, { key: '5:30:00', value: 947 }, { key: '5:40:00', value: 951 }, { key: '5:50:00', value: 952 }, { key: '6:00:00', value: 944 }, { key: '6:10:00', value: 944 }, { key: '6:20:00', value: 941 }, { key: '6:30:00', value: 935 }, { key: '6:40:00', value: 926 }, { key: '6:50:00', value: 912 }, { key: '7:00:00', value: 916 }, { key: '7:10:00', value: 929 }, { key: '7:20:00', value: 932 }, { key: '7:30:00', value: 939 }, { key: '7:40:00', value: 925 }, { key: '7:50:00', value: 902 }, { key: '8:00:00', value: 860 }, { key: '8:10:00', value: 866 }, { key: '8:20:00', value: 907 }, { key: '8:30:00', value: 921 }, { key: '8:40:00', value: 924 }, { key: '8:50:00', value: 927 }, { key: '9:00:00', value: 931 }, { key: '9:10:00', value: 930 }, { key: '9:20:00', value: 932 }, { key: '9:30:00', value: 932 }, { key: '9:40:00', value: 941 }, { key: '9:50:00', value: 940 }, { key: '10:00:00', value: 953 }, { key: '10:10:00', value: 961 }, { key: '10:20:00', value: 964 }, { key: '10:30:00', value: 964 }, { key: '10:40:00', value: 943 }, { key: '10:50:00', value: 939 }, { key: '11:00:00', value: 932 }, { key: '11:10:00', value: 929 }, { key: '11:20:00', value: 924 }, { key: '11:30:00', value: 889 }, { key: '11:40:00', value: 914 }, { key: '11:50:00', value: 921 }, { key: '12:00:00', value: 937 }, { key: '12:10:00', value: 954 }, { key: '12:20:00', value: 926 }, { key: '12:30:00', value: 888 }, { key: '12:40:00', value: 892 }, { key: '12:50:00', value: 882 }, { key: '13:00:00', value: 894 }, { key: '13:10:00', value: 895}, { key: '13:20:00', value: 840 }, { key: '13:30:00', value: 782 }, { key: '13:40:00', value: 777 }, { key: '13:50:00', value: 785 }, { key: '14:00:00', value: 839 }, { key: '14:10:00', value: 902 }, { key: '14:20:00', value: 935 }, { key: '14:30:00', value: 936 }, { key: '14:40:00', value: 911 }, { key: '14:50:00', value: 915 }, { key: '15:00:00', value: 927 }, { key: '15:10:00', value: 934 }, { key: '15:20:00', value: 928 }, { key: '15:30:00', value: 917 }, { key: '15:40:00', value: 923 }, { key: '15:50:00', value: 927 }, { key: '16:00:00', value: 934 }, { key: '16:10:00', value: 938 }, { key: '16:20:00', value: 941 }, { key: '16:30:00', value: 934 }, { key: '16:40:00', value: 940 }, { key: '16:50:00', value: 931 }, { key: '17:00:00', value: 898 }, { key: '17:10:00', value: 884 }, { key: '17:20:00', value: 865 }, { key: '17:30:00', value: 854 }, { key: '17:40:00', value: 841 }, { key: '17:50:00', value: 834 }, { key: '18:00:00', value: 824 }, { key: '18:10:00', value: 820 }, { key: '18:20:00', value: 816 }, { key: '18:30:00', value: 822 }, { key: '18:40:00', value: 823 }, { key: '18:50:00', value: 802 }, { key: '19:00:00', value: 812 }, { key: '19:10:00', value: 829 }, { key: '19:20:00', value: 844 }, { key: '19:30:00', value: 859 }, { key: '19:40:00', value: 852 }, { key: '19:50:00', value: 852 }, { key: '20:00:00', value: 843 }, { key: '20:10:00', value: 840 }, { key: '20:20:00', value: 838 }, { key: '20:30:00', value: 831 }, { key: '20:40:00', value: 831 }, { key: '20:50:00', value: 847 }, { key: '21:00:00', value: 884 }, { key: '21:10:00', value: 925 }, { key: '21:20:00', value: 947 }, { key: '21:30:00', value: 951 }, { key: '21:40:00', value: 957 }, { key: '21:50:00', value: 945 }, { key: '22:00:00', value: 939 }, { key: '22:10:00', value: 930 }, { key: '22:20:00', value: 931 }, { key: '22:30:00', value: 915 }, { key: '22:40:00', value: 903 }, { key: '22:50:00', value: 883 }, { key: '23:00:00', value: 868 }, { key: '23:10:00', value: 865 }, { key: '23:20:00', value: 860 }, { key: '23:30:00', value: 869 }, { key: '23:40:00', value: 872 }, { key: '23:50:00', value: 887 }]
	}, {
		key: '2016/6/14',
		values: [{ key: '0:00:00', value: 911 }, { key: '0:10:00', value: 928 }, { key: '0:20:00', value: 938 }, { key: '0:30:00', value: 944 }, { key: '0:40:00', value: 951 }, { key: '0:50:00', value: 952 }, { key: '1:00:00', value: 933 }, { key: '1:10:00', value: 926 }, { key: '1:20:00', value: 918 }, { key: '1:30:00', value: 913 }, { key: '1:40:00', value: 917 }, { key: '1:50:00', value: 913 }, { key: '2:00:00', value: 905 }, { key: '2:10:00', value: 909 }, { key: '2:20:00', value: 910 }, { key: '2:30:00', value: 905 }, { key: '2:40:00', value: 912 }, { key: '2:50:00', value: 901 }, { key: '3:00:00', value: 892 }, { key: '3:10:00', value: 880 }, { key: '3:20:00', value: 883 }, { key: '3:30:00', value: 884 }, { key: '3:40:00', value: 884 }, { key: '3:50:00', value: 885 }, { key: '4:00:00', value: 880 }, { key: '4:10:00', value: 881 }, { key: '4:20:00', value: 882 }, { key: '4:30:00', value: 883 }, { key: '4:40:00', value: 886 }, { key: '4:50:00', value: 904 }, { key: '5:00:00', value: 912 }, { key: '5:10:00', value: 936 }, { key: '5:20:00', value: 940 }, { key: '5:30:00', value: 943 }, { key: '5:40:00', value: 947 }, { key: '5:50:00', value: 934 }, { key: '6:00:00', value: 933 }, { key: '6:10:00', value: 909 }, { key: '6:20:00', value: 886 }, { key: '6:30:00', value: 875 }, { key: '6:40:00', value: 854 }, { key: '6:50:00', value: 854 }, { key: '7:00:00', value: 861 }, { key: '7:10:00', value: 853 }, { key: '7:20:00', value: 860 }, { key: '7:30:00', value: 871 }, { key: '7:40:00', value: 847 }, { key: '7:50:00', value: 822 }, { key: '8:00:00', value: 775 }, { key: '8:10:00', value: 783 }, { key: '8:20:00', value: 800 }, { key: '8:30:00', value: 810 }, { key: '8:40:00', value: 833 }, { key: '8:50:00', value: 849 }, { key: '9:00:00', value: 843 }, { key: '9:10:00', value: 844 }, { key: '9:20:00', value: 837 }, { key: '9:30:00', value: 839 }, { key: '9:40:00', value: 839 }, { key: '9:50:00', value: 848 }, { key: '10:00:00', value: 860 }, { key: '10:10:00', value: 859 }, { key: '10:20:00', value: 851 }, { key: '10:30:00', value: 846 }, { key: '10:40:00', value: 842 }, { key: '10:50:00', value: 823 }, { key: '11:00:00', value: 795 }, { key: '11:10:00', value: 785 }, { key: '11:20:00', value: 769 }, { key: '11:30:00', value: 730 }, { key: '11:40:00', value: 727 }, { key: '11:50:00', value: 739 }, { key: '12:00:00', value: 754 }, { key: '12:10:00', value: 737 }, { key: '12:20:00', value: 726 }, { key: '12:30:00', value: 715 }, { key: '12:40:00', value: 701 }, { key: '12:50:00', value: 700 }, { key: '13:00:00', value: 700 }, { key: '13:10:00', value: 673}, { key: '13:20:00', value: 703 }, { key: '13:30:00', value: 716 }, { key: '13:40:00', value: 693 }, { key: '13:50:00', value: 785 }, { key: '14:00:00', value: 839 }, { key: '14:10:00', value: 902 }, { key: '14:20:00', value: 664 }, { key: '14:30:00', value: 654 }, { key: '14:40:00', value: 670 }, { key: '14:50:00', value: 667 }, { key: '15:00:00', value: 685 }, { key: '15:10:00', value: 686 }, { key: '15:20:00', value: 690 }, { key: '15:30:00', value: 689 }, { key: '15:40:00', value: 692 }, { key: '15:50:00', value: 695 }, { key: '16:00:00', value: 695 }, { key: '16:10:00', value: 692 }, { key: '16:20:00', value: 692 }, { key: '16:30:00', value: 692 }, { key: '16:40:00', value: 689 }, { key: '16:50:00', value: 681 }, { key: '17:00:00', value: 673 }, { key: '17:10:00', value: 684 }, { key: '17:20:00', value: 701 }, { key: '17:30:00', value: 722 }, { key: '17:40:00', value: 751 }, { key: '17:50:00', value: 766 }, { key: '18:00:00', value: 774 }, { key: '18:10:00', value: 771 }, { key: '18:20:00', value: 772 }, { key: '18:30:00', value: 772 }, { key: '18:40:00', value: 776 }, { key: '18:50:00', value: 786 }, { key: '19:00:00', value: 793 }, { key: '19:10:00', value: 810 }, { key: '19:20:00', value: 843 }, { key: '19:30:00', value: 880 }, { key: '19:40:00', value: 900 }, { key: '19:50:00', value: 903 }, { key: '20:00:00', value: 893 }, { key: '20:10:00', value: 883 }, { key: '20:20:00', value: 889 }, { key: '20:30:00', value: 873 }, { key: '20:40:00', value: 879 }, { key: '20:50:00', value: 876 }, { key: '21:00:00', value: 897 }, { key: '21:10:00', value: 923 }, { key: '21:20:00', value: 929 }, { key: '21:30:00', value: 941 }, { key: '21:40:00', value: 952 }, { key: '21:50:00', value: 959 }, { key: '22:00:00', value: 947 }, { key: '22:10:00', value: 922 }, { key: '22:20:00', value: 937 }, { key: '22:30:00', value: 924 }, { key: '22:40:00', value: 920 }, { key: '22:50:00', value: 918 }, { key: '23:00:00', value: 899 }, { key: '23:10:00', value: 898 }, { key: '23:20:00', value: 896 }, { key: '23:30:00', value: 918 }, { key: '23:40:00', value: 924 }, { key: '23:50:00', value: 938 }]
	}, {
		key: '2016/6/15',
		values: [{ key: '0:00:00', value: 969 }, { key: '0:10:00', value: 999 }, { key: '0:20:00', value: 993 }, { key: '0:30:00', value: 966 }, { key: '0:40:00', value: 957 }, { key: '0:50:00', value: 961 }, { key: '1:00:00', value: 962 }, { key: '1:10:00', value: 957 }, { key: '1:20:00', value: 943 }, { key: '1:30:00', value: 926 }, { key: '1:40:00', value: 920 }, { key: '1:50:00', value: 922 }, { key: '2:00:00', value: 914 }, { key: '2:10:00', value: 891 }, { key: '2:20:00', value: 892 }, { key: '2:30:00', value: 898 }, { key: '2:40:00', value: 893 }, { key: '2:50:00', value: 884 }, { key: '3:00:00', value: 888 }, { key: '3:10:00', value: 868 }, { key: '3:20:00', value: 870 }, { key: '3:30:00', value: 865 }, { key: '3:40:00', value: 863 }, { key: '3:50:00', value: 871 }, { key: '4:00:00', value: 867 }, { key: '4:10:00', value: 868 }, { key: '4:20:00', value: 871 }, { key: '4:30:00', value: 874 }, { key: '4:40:00', value: 878 }, { key: '4:50:00', value: 897 }, { key: '5:00:00', value: 907 }, { key: '5:10:00', value: 918 }, { key: '5:20:00', value: 928 }, { key: '5:30:00', value: 929 }, { key: '5:40:00', value: 915 }, { key: '5:50:00', value: 901 }, { key: '6:00:00', value: 904 }, { key: '6:10:00', value: 895 }, { key: '6:20:00', value: 875 }, { key: '6:30:00', value: 857 }, { key: '6:40:00', value: 844 }, { key: '6:50:00', value: 843 }, { key: '7:00:00', value: 853 }, { key: '7:10:00', value: 854 }, { key: '7:20:00', value: 866 }, { key: '7:30:00', value: 881 }, { key: '7:40:00', value: 870 }, { key: '7:50:00', value: 859 }, { key: '8:00:00', value: 830 }, { key: '8:10:00', value: 847 }, { key: '8:20:00', value: 852 }, { key: '8:30:00', value: 870 }, { key: '8:40:00', value: 866 }, { key: '8:50:00', value: 868 }, { key: '9:00:00', value: 873 }, { key: '9:10:00', value: 872 }, { key: '9:20:00', value: 872 }, { key: '9:30:00', value: 890 }, { key: '9:40:00', value: 900 }, { key: '9:50:00', value: 841 }, { key: '10:00:00', value: 817 }, { key: '10:10:00', value: 813 }, { key: '10:20:00', value: 816 }, { key: '10:30:00', value: 806 }, { key: '10:40:00', value: 796 }, { key: '10:50:00', value: 788 }, { key: '11:00:00', value: 772 }, { key: '11:10:00', value: 767 }, { key: '11:20:00', value: 754 }, { key: '11:30:00', value: 751 }, { key: '11:40:00', value: 750 }, { key: '11:50:00', value: 751 }, { key: '12:00:00', value: 763 }, { key: '12:10:00', value: 786 }, { key: '12:20:00', value: 784 }, { key: '12:30:00', value: 805 }, { key: '12:40:00', value: 783 }, { key: '12:50:00', value: 746 }, { key: '13:00:00', value: 777 }, { key: '13:10:00', value: 800}, { key: '13:20:00', value: 800 }, { key: '13:30:00', value: 789 }, { key: '13:40:00', value: 779 }, { key: '13:50:00', value: 771 }, { key: '14:00:00', value: 767 }, { key: '14:10:00', value: 758 }, { key: '14:20:00', value: 753 }, { key: '14:30:00', value: 733 }, { key: '14:40:00', value: 747 }, { key: '14:50:00', value: 742 }, { key: '15:00:00', value: 733 }, { key: '15:10:00', value: 737 }, { key: '15:20:00', value: 738 }, { key: '15:30:00', value: 745 }, { key: '15:40:00', value: 745 }, { key: '15:50:00', value: 746 }, { key: '16:00:00', value: 752 }, { key: '16:10:00', value: 797 }, { key: '16:20:00', value: 840 }, { key: '16:30:00', value: 826 }, { key: '16:40:00', value: 814 }, { key: '16:50:00', value: 801 }, { key: '17:00:00', value: 754 }, { key: '17:10:00', value: 763 }, { key: '17:20:00', value: 759 }, { key: '17:30:00', value: 749 }, { key: '17:40:00', value: 746 }, { key: '17:50:00', value: 736 }, { key: '18:00:00', value: 730 }, { key: '18:10:00', value: 728 }, { key: '18:20:00', value: 728 }, { key: '18:30:00', value: 730 }, { key: '18:40:00', value: 729 }, { key: '18:50:00', value: 735 }, { key: '19:00:00', value: 755 }, { key: '19:10:00', value: 775 }, { key: '19:20:00', value: 780 }, { key: '19:30:00', value: 777 }, { key: '19:40:00', value: 768 }, { key: '19:50:00', value: 770 }, { key: '20:00:00', value: 764 }, { key: '20:10:00', value: 763 }, { key: '20:20:00', value: 762 }, { key: '20:30:00', value: 763 }, { key: '20:40:00', value: 763 }, { key: '20:50:00', value: 764 }, { key: '21:00:00', value: 794 }, { key: '21:10:00', value: 837 }, { key: '21:20:00', value: 856 }, { key: '21:30:00', value: 855 }, { key: '21:40:00', value: 864 }, { key: '21:50:00', value: 870 }, { key: '22:00:00', value: 864 }, { key: '22:10:00', value: 864 }, { key: '22:20:00', value: 853 }, { key: '22:30:00', value: 852 }, { key: '22:40:00', value: 852 }, { key: '22:50:00', value: 845 }, { key: '23:00:00', value: 839 }, { key: '23:10:00', value: 837 }, { key: '23:20:00', value: 839 }, { key: '23:30:00', value: 844 }, { key: '23:40:00', value: 850 }, { key: '23:50:00', value: 857 }]
	} ,{
		key: '2016/6/16',
		values: [{key:'0:00:00', value: 893},
 {key:'0:10:00', value: 933},
 {key:'0:20:00', value: 947},
 {key:'0:30:00', value: 954},
 {key:'0:40:00', value: 958},
 {key:'0:50:00', value: 958},
 {key:'1:00:00', value: 960},
 {key:'1:10:00', value: 966},
 {key:'1:20:00', value: 970},
 {key:'1:30:00', value: 973},
 {key:'1:40:00', value: 973},
 {key:'1:50:00', value: 975},
 {key:'2:00:00', value: 976},
 {key:'2:10:00', value: 982},
 {key:'2:20:00', value: 978},
 {key:'2:30:00', value: 967},
 {key:'2:40:00', value: 947},
 {key:'2:50:00', value: 923},
 {key:'3:00:00', value: 876},
 {key:'3:10:00', value: 827},
 {key:'3:20:00', value: 814},
 {key:'3:30:00', value: 804},
 {key:'3:40:00', value: 800},
 {key:'3:50:00', value: 797},
 {key:'4:00:00', value: 800},
 {key:'4:10:00', value: 799},
 {key:'4:20:00', value: 808},
 {key:'4:30:00', value: 812},
 {key:'4:40:00', value: 822},
 {key:'4:50:00', value: 833},
 {key:'5:00:00', value: 845},
 {key:'5:10:00', value: 857},
 {key:'5:20:00', value: 862},
 {key:'5:30:00', value: 862},
 {key:'5:40:00', value: 852},
 {key:'5:50:00', value: 844},
 {key:'6:00:00', value: 864},
 {key:'6:10:00', value: 880},
 {key:'6:20:00', value: 874},
 {key:'6:30:00', value: 853},
 {key:'6:40:00', value: 832},
 {key:'6:50:00', value: 825},
 {key:'7:00:00', value: 831},
 {key:'7:10:00', value: 830},
 {key:'7:20:00', value: 829},
 {key:'7:30:00', value: 849},
 {key:'7:40:00', value: 854},
 {key:'7:50:00', value: 843},
 {key:'8:00:00', value: 795},
 {key:'8:10:00', value: 799},
 {key:'8:20:00', value: 800},
 {key:'8:30:00', value: 825},
 {key:'8:40:00', value: 852},
 {key:'8:50:00', value: 898},
 {key:'9:00:00', value: 920},
 {key:'9:10:00', value: 923},
 {key:'9:20:00', value: 927},
 {key:'9:30:00', value: 931},
 {key:'9:40:00', value: 937},
 {key:'9:50:00', value: 936},
 {key:'10:00:00', value: 939},
 {key:'10:10:00', value: 945},
 {key:'10:20:00', value: 947},
 {key:'10:30:00', value: 941},
 {key:'10:40:00', value: 937},
 {key:'10:50:00', value: 927},
 {key:'11:00:00', value: 918},
 {key:'11:10:00', value: 909},
 {key:'11:20:00', value: 909},
 {key:'11:30:00', value: 887},
 {key:'11:40:00', value: 895},
 {key:'11:50:00', value: 903},
 {key:'12:00:00', value: 914},
 {key:'12:10:00', value: 922},
 {key:'12:20:00', value: 899},
 {key:'12:30:00', value: 786},
 {key:'12:40:00', value: 744},
 {key:'12:50:00', value: 742},
 {key:'13:00:00', value: 750},
 {key:'13:10:00', value: 779},
 {key:'13:20:00', value: 828},
 {key:'13:30:00', value: 862},
 {key:'13:40:00', value: 894},
 {key:'13:50:00', value: 878},
 {key:'14:00:00', value: 883},
 {key:'14:10:00', value: 886},
 {key:'14:20:00', value: 885},
 {key:'14:30:00', value: 879},
 {key:'14:40:00', value: 877},
 {key:'14:50:00', value: 878},
 {key:'15:00:00', value: 890},
 {key:'15:10:00', value: 895},
 {key:'15:20:00', value: 895},
 {key:'15:30:00', value: 894},
 {key:'15:40:00', value: 895},
 {key:'15:50:00', value: 902},
 {key:'16:00:00', value: 899},
 {key:'16:10:00', value: 908},
 {key:'16:20:00', value: 903},
 {key:'16:30:00', value: 897},
 {key:'16:40:00', value: 885},
 {key:'16:50:00', value: 878},
 {key:'17:00:00', value: 854},
 {key:'17:10:00', value: 855},
 {key:'17:20:00', value: 852},
 {key:'17:30:00', value: 837},
 {key:'17:40:00', value: 840},
 {key:'17:50:00', value: 832},
 {key:'18:00:00', value: 827},
 {key:'18:10:00', value: 825},
 {key:'18:20:00', value: 828},
 {key:'18:30:00', value: 824},
 {key:'18:40:00', value: 817},
 {key:'18:50:00', value: 820},
 {key:'19:00:00', value: 822},
 {key:'19:10:00', value: 830},
 {key:'19:20:00', value: 834},
 {key:'19:30:00', value: 843},
 {key:'19:40:00', value: 843},
 {key:'19:50:00', value: 836},
 {key:'20:00:00', value: 829},
 {key:'20:10:00', value: 825},
 {key:'20:20:00', value: 828},
 {key:'20:30:00', value: 817},
 {key:'20:40:00', value: 820},
 {key:'20:50:00', value: 823},
 {key:'21:00:00', value: 866},
 {key:'21:10:00', value: 905},
 {key:'21:20:00', value: 913},
 {key:'21:30:00', value: 915},
 {key:'21:40:00', value: 909},
 {key:'21:50:00', value: 884},
 {key:'22:00:00', value: 871},
 {key:'22:10:00', value: 868},
 {key:'22:20:00', value: 865},
 {key:'22:30:00', value: 881},
 {key:'22:40:00', value: 906},
 {key:'22:50:00', value: 906},
 {key:'23:00:00', value: 899},
 {key:'23:10:00', value: 891},
 {key:'23:20:00', value: 896},
 {key:'23:30:00', value: 899},
 {key:'23:40:00', value: 907},
 {key:'23:50:00', value: 919}]}
 ,{
		key: '2016/6/17',
		values: [{key:'0:00:00', value: 935},
 {key:'0:10:00', value: 951},
 {key:'0:20:00', value: 961},
 {key:'0:30:00', value: 960},
 {key:'0:40:00', value: 955},
 {key:'0:50:00', value: 948},
 {key:'1:00:00', value: 945},
 {key:'1:10:00', value: 936},
 {key:'1:20:00', value: 924},
 {key:'1:30:00', value: 917},
 {key:'1:40:00', value: 911},
 {key:'1:50:00', value: 908},
 {key:'2:00:00', value: 907},
 {key:'2:10:00', value: 902},
 {key:'2:20:00', value: 900},
 {key:'2:30:00', value: 900},
 {key:'2:40:00', value: 898},
 {key:'2:50:00', value: 896},
 {key:'3:00:00', value: 891},
 {key:'3:10:00', value: 902},
 {key:'3:20:00', value: 911},
 {key:'3:30:00', value: 919},
 {key:'3:40:00', value: 923},
 {key:'3:50:00', value: 932},
 {key:'4:00:00', value: 944},
 {key:'4:10:00', value: 950},
 {key:'4:20:00', value: 954},
 {key:'4:30:00', value: 963},
 {key:'4:40:00', value: 973},
 {key:'4:50:00', value: 981},
 {key:'5:00:00', value: 991},
 {key:'5:10:00', value: 999},
 {key:'5:20:00', value: 999},
 {key:'5:30:00', value: 993},
 {key:'5:40:00', value: 978},
 {key:'5:50:00', value: 967},
 {key:'6:00:00', value: 963},
 {key:'6:10:00', value: 950},
 {key:'6:20:00', value: 951},
 {key:'6:30:00', value: 935},
 {key:'6:40:00', value: 918},
 {key:'6:50:00', value: 916},
 {key:'7:00:00', value: 931},
 {key:'7:10:00', value: 945},
 {key:'7:20:00', value: 945},
 {key:'7:30:00', value: 951},
 {key:'7:40:00', value: 946},
 {key:'7:50:00', value: 935},
 {key:'8:00:00', value: 911},
 {key:'8:10:00', value: 914},
 {key:'8:20:00', value: 912},
 {key:'8:30:00', value: 920},
 {key:'8:40:00', value: 914},
 {key:'8:50:00', value: 922},
 {key:'9:00:00', value: 929},
 {key:'9:10:00', value: 918},
 {key:'9:20:00', value: 917},
 {key:'9:30:00', value: 898},
 {key:'9:40:00', value: 895},
 {key:'9:50:00', value: 897},
 {key:'10:00:00', value: 906},
 {key:'10:10:00', value: 912},
 {key:'10:20:00', value: 917},
 {key:'10:30:00', value: 912},
 {key:'10:40:00', value: 900},
 {key:'10:50:00', value: 866},
 {key:'11:00:00', value: 846},
 {key:'11:10:00', value: 851},
 {key:'11:20:00', value: 837},
 {key:'11:30:00', value: 812},
 {key:'11:40:00', value: 800},
 {key:'11:50:00', value: 817},
 {key:'12:00:00', value: 844},
 {key:'12:10:00', value: 863},
 {key:'12:20:00', value: 874},
 {key:'12:30:00', value: 886},
 {key:'12:40:00', value: 882},
 {key:'12:50:00', value: 877},
 {key:'13:00:00', value: 890},
 {key:'13:10:00', value: 887},
 {key:'13:20:00', value: 884},
 {key:'13:30:00', value: 880},
 {key:'13:40:00', value: 890},
 {key:'13:50:00', value: 881},
 {key:'14:00:00', value: 873},
 {key:'14:10:00', value: 924},
 {key:'14:20:00', value: 930},
 {key:'14:30:00', value: 935},
 {key:'14:40:00', value: 928},
 {key:'14:50:00', value: 899},
 {key:'15:00:00', value: 878},
 {key:'15:10:00', value: 882},
 {key:'15:20:00', value: 893},
 {key:'15:30:00', value: 894},
 {key:'15:40:00', value: 894},
 {key:'15:50:00', value: 889},
 {key:'16:00:00', value: 885},
 {key:'16:10:00', value: 902},
 {key:'16:20:00', value: 907},
 {key:'16:30:00', value: 879},
 {key:'16:40:00', value: 851},
 {key:'16:50:00', value: 828},
 {key:'17:00:00', value: 805},
 {key:'17:10:00', value: 817},
 {key:'17:20:00', value: 820},
 {key:'17:30:00', value: 823},
 {key:'17:40:00', value: 838},
 {key:'17:50:00', value: 833},
 {key:'18:00:00', value: 815},
 {key:'18:10:00', value: 802},
 {key:'18:20:00', value: 791},
 {key:'18:30:00', value: 775},
 {key:'18:40:00', value: 768},
 {key:'18:50:00', value: 758},
 {key:'19:00:00', value: 773},
 {key:'19:10:00', value: 780},
 {key:'19:20:00', value: 791},
 {key:'19:30:00', value: 802},
 {key:'19:40:00', value: 791},
 {key:'19:50:00', value: 801},
 {key:'20:00:00', value: 792},
 {key:'20:10:00', value: 792},
 {key:'20:20:00', value: 791},
 {key:'20:30:00', value: 801},
 {key:'20:40:00', value: 802},
 {key:'20:50:00', value: 812},
 {key:'21:00:00', value: 846},
 {key:'21:10:00', value: 884},
 {key:'21:20:00', value: 906},
 {key:'21:30:00', value: 900},
 {key:'21:40:00', value: 914},
 {key:'21:50:00', value: 914},
 {key:'22:00:00', value: 896},
 {key:'22:10:00', value: 902},
 {key:'22:20:00', value: 908},
 {key:'22:30:00', value: 913},
 {key:'22:40:00', value: 915},
 {key:'22:50:00', value: 901},
 {key:'23:00:00', value: 897},
 {key:'23:10:00', value: 893},
 {key:'23:20:00', value: 891},
 {key:'23:30:00', value: 895},
 {key:'23:40:00', value: 905},
 {key:'23:50:00', value: 912}]}
 ,{
		key: '2016/6/18',
		values: [ {key:'0:00:00', value: 936},
 {key:'0:10:00', value: 949},
 {key:'0:20:00', value: 939},
 {key:'0:30:00', value: 933},
 {key:'0:40:00', value: 932},
 {key:'0:50:00', value: 929},
 {key:'1:00:00', value: 919},
 {key:'1:10:00', value: 922},
 {key:'1:20:00', value: 920},
 {key:'1:30:00', value: 919},
 {key:'1:40:00', value: 925},
 {key:'1:50:00', value: 934},
 {key:'2:00:00', value: 938},
 {key:'2:10:00', value: 933},
 {key:'2:20:00', value: 935},
 {key:'2:30:00', value: 919},
 {key:'2:40:00', value: 917},
 {key:'2:50:00', value: 916},
 {key:'3:00:00', value: 915},
 {key:'3:10:00', value: 915},
 {key:'3:20:00', value: 907},
 {key:'3:30:00', value: 905},
 {key:'3:40:00', value: 897},
 {key:'3:50:00', value: 895},
 {key:'4:00:00', value: 893},
 {key:'4:10:00', value: 885},
 {key:'4:20:00', value: 886},
 {key:'4:30:00', value: 887},
 {key:'4:40:00', value: 891},
 {key:'4:50:00', value: 896},
 {key:'5:00:00', value: 900},
 {key:'5:10:00', value: 901},
 {key:'5:20:00', value: 909},
 {key:'5:30:00', value: 905},
 {key:'5:40:00', value: 904},
 {key:'5:50:00', value: 904},
 {key:'6:00:00', value: 903},
 {key:'6:10:00', value: 906},
 {key:'6:20:00', value: 891},
 {key:'6:30:00', value: 884},
 {key:'6:40:00', value: 879},
 {key:'6:50:00', value: 872},
 {key:'7:00:00', value: 875},
 {key:'7:10:00', value: 875},
 {key:'7:20:00', value: 880},
 {key:'7:30:00', value: 884},
 {key:'7:40:00', value: 874},
 {key:'7:50:00', value: 849},
 {key:'8:00:00', value: 810},
 {key:'8:10:00', value: 816},
 {key:'8:20:00', value: 825},
 {key:'8:30:00', value: 833},
 {key:'8:40:00', value: 835},
 {key:'8:50:00', value: 837},
 {key:'9:00:00', value: 841},
 {key:'9:10:00', value: 851},
 {key:'9:20:00', value: 855},
 {key:'9:30:00', value: 842},
 {key:'9:40:00', value: 849},
 {key:'9:50:00', value: 875},
 {key:'10:00:00', value: 893},
 {key:'10:10:00', value: 897},
 {key:'10:20:00', value: 900},
 {key:'10:30:00', value: 891},
 {key:'10:40:00', value: 885},
 {key:'10:50:00', value: 877},
 {key:'11:00:00', value: 859},
 {key:'11:10:00', value: 864},
 {key:'11:20:00', value: 851},
 {key:'11:30:00', value: 832},
 {key:'11:40:00', value: 846},
 {key:'11:50:00', value: 848},
 {key:'12:00:00', value: 871},
 {key:'12:10:00', value: 887},
 {key:'12:20:00', value: 895},
 {key:'12:30:00', value: 855},
 {key:'12:40:00', value: 822},
 {key:'12:50:00', value: 811},
 {key:'13:00:00', value: 802},
 {key:'13:10:00', value: 738},
 {key:'13:20:00', value: 740},
 {key:'13:30:00', value: 740},
 {key:'13:40:00', value: 740},
 {key:'13:50:00', value: 737},
 {key:'14:00:00', value: 735},
 {key:'14:10:00', value: 738},
 {key:'14:20:00', value: 739},
 {key:'14:30:00', value: 741},
 {key:'14:40:00', value: 735},
 {key:'14:50:00', value: 738},
 {key:'15:00:00', value: 737},
 {key:'15:10:00', value: 747},
 {key:'15:20:00', value: 780},
 {key:'15:30:00', value: 820},
 {key:'15:40:00', value: 852},
 {key:'15:50:00', value: 884},
 {key:'16:00:00', value: 928},
 {key:'16:10:00', value: 945},
 {key:'16:20:00', value: 943},
 {key:'16:30:00', value: 934},
 {key:'16:40:00', value: 926},
 {key:'16:50:00', value: 920},
 {key:'17:00:00', value: 910},
 {key:'17:10:00', value: 909},
 {key:'17:20:00', value: 903},
 {key:'17:30:00', value: 902},
 {key:'17:40:00', value: 907},
 {key:'17:50:00', value: 912},
 {key:'18:00:00', value: 904},
 {key:'18:10:00', value: 904},
 {key:'18:20:00', value: 906},
 {key:'18:30:00', value: 900},
 {key:'18:40:00', value: 899},
 {key:'18:50:00', value: 900},
 {key:'19:00:00', value: 909},
 {key:'19:10:00', value: 921},
 {key:'19:20:00', value: 939},
 {key:'19:30:00', value: 934},
 {key:'19:40:00', value: 921},
 {key:'19:50:00', value: 916},
 {key:'20:00:00', value: 917},
 {key:'20:10:00', value: 925},
 {key:'20:20:00', value: 923},
 {key:'20:30:00', value: 928},
 {key:'20:40:00', value: 925},
 {key:'20:50:00', value: 928},
 {key:'21:00:00', value: 935},
 {key:'21:10:00', value: 967},
 {key:'21:20:00', value: 985},
 {key:'21:30:00', value: 970},
 {key:'21:40:00', value: 963},
 {key:'21:50:00', value: 962},
 {key:'22:00:00', value: 955},
 {key:'22:10:00', value: 953},
 {key:'22:20:00', value: 945},
 {key:'22:30:00', value: 944},
 {key:'22:40:00', value: 935},
 {key:'22:50:00', value: 928},
 {key:'23:00:00', value: 928},
 {key:'23:10:00', value: 918},
 {key:'23:20:00', value: 917},
 {key:'23:30:00', value: 918},
 {key:'23:40:00', value: 917},
 {key:'23:50:00', value: 929}]}
 ,{
		key: '2016/6/19',
		values: [ {key:'0:00:00', value: 950},
 {key:'0:10:00', value: 956},
 {key:'0:20:00', value: 958},
 {key:'0:30:00', value: 958},
 {key:'0:40:00', value: 949},
 {key:'0:50:00', value: 943},
 {key:'1:00:00', value: 928},
 {key:'1:10:00', value: 928},
 {key:'1:20:00', value: 921},
 {key:'1:30:00', value: 920},
 {key:'1:40:00', value: 914},
 {key:'1:50:00', value: 909},
 {key:'2:00:00', value: 908},
 {key:'2:10:00', value: 900},
 {key:'2:20:00', value: 899},
 {key:'2:30:00', value: 897},
 {key:'2:40:00', value: 894},
 {key:'2:50:00', value: 891},
 {key:'3:00:00', value: 886},
 {key:'3:10:00', value: 884},
 {key:'3:20:00', value: 877},
 {key:'3:30:00', value: 852},
 {key:'3:40:00', value: 805},
 {key:'3:50:00', value: 800},
 {key:'4:00:00', value: 802},
 {key:'4:10:00', value: 800},
 {key:'4:20:00', value: 801},
 {key:'4:30:00', value: 800},
 {key:'4:40:00', value: 800},
 {key:'4:50:00', value: 800},
 {key:'5:00:00', value: 796},
 {key:'5:10:00', value: 792},
 {key:'5:20:00', value: 780},
 {key:'5:30:00', value: 777},
 {key:'5:40:00', value: 768},
 {key:'5:50:00', value: 765},
 {key:'6:00:00', value: 765},
 {key:'6:10:00', value: 765},
 {key:'6:20:00', value: 765},
 {key:'6:30:00', value: 765},
 {key:'6:40:00', value: 765},
 {key:'6:50:00', value: 765},
 {key:'7:00:00', value: 768},
 {key:'7:10:00', value: 770},
 {key:'7:20:00', value: 770},
 {key:'7:30:00', value: 770},
 {key:'7:40:00', value: 770},
 {key:'7:50:00', value: 770},
 {key:'8:00:00', value: 770},
 {key:'8:10:00', value: 770},
 {key:'8:20:00', value: 770},
 {key:'8:30:00', value: 770},
 {key:'8:40:00', value: 770},
 {key:'8:50:00', value: 770},
 {key:'9:00:00', value: 776},
 {key:'9:10:00', value: 798},
 {key:'9:20:00', value: 810},
 {key:'9:30:00', value: 815},
 {key:'9:40:00', value: 815},
 {key:'9:50:00', value: 818},
 {key:'10:00:00', value: 820},
 {key:'10:10:00', value: 820},
 {key:'10:20:00', value: 820},
 {key:'10:30:00', value: 820},
 {key:'10:40:00', value: 820},
 {key:'10:50:00', value: 820},
 {key:'11:00:00', value: 820},
 {key:'11:10:00', value: 820},
 {key:'11:20:00', value: 820},
 {key:'11:30:00', value: 820},
 {key:'11:40:00', value: 820},
 {key:'11:50:00', value: 820},
 {key:'12:00:00', value: 820},
 {key:'12:10:00', value: 820},
 {key:'12:20:00', value: 820},
 {key:'12:30:00', value: 820},
 {key:'12:40:00', value: 820},
 {key:'12:50:00', value: 820},
 {key:'13:00:00', value: 820},
 {key:'13:10:00', value: 820},
 {key:'13:20:00', value: 820},
 {key:'13:30:00', value: 820},
 {key:'13:40:00', value: 820},
 {key:'13:50:00', value: 820},
 {key:'14:00:00', value: 820},
 {key:'14:10:00', value: 820},
 {key:'14:20:00', value: 820},
 {key:'14:30:00', value: 820},
 {key:'14:40:00', value: 820},
 {key:'14:50:00', value: 820},
 {key:'15:00:00', value: 821},
 {key:'15:10:00', value: 821},
 {key:'15:20:00', value: 820},
 {key:'15:30:00', value: 820},
 {key:'15:40:00', value: 820},
 {key:'15:50:00', value: 820},
 {key:'16:00:00', value: 820},
 {key:'16:10:00', value: 820},
 {key:'16:20:00', value: 820},
 {key:'16:30:00', value: 820},
 {key:'16:40:00', value: 820},
 {key:'16:50:00', value: 820},
 {key:'17:00:00', value: 820},
 {key:'17:10:00', value: 820},
 {key:'17:20:00', value: 820},
 {key:'17:30:00', value: 820},
 {key:'17:40:00', value: 820},
 {key:'17:50:00', value: 821},
 {key:'18:00:00', value: 820},
 {key:'18:10:00', value: 820},
 {key:'18:20:00', value: 820},
 {key:'18:30:00', value: 820},
 {key:'18:40:00', value: 821},
 {key:'18:50:00', value: 820},
 {key:'19:00:00', value: 820},
 {key:'19:10:00', value: 820},
 {key:'19:20:00', value: 820},
 {key:'19:30:00', value: 820},
 {key:'19:40:00', value: 820},
 {key:'19:50:00', value: 821},
 {key:'20:00:00', value: 820},
 {key:'20:10:00', value: 820},
 {key:'20:20:00', value: 821},
 {key:'20:30:00', value: 821},
 {key:'20:40:00', value: 820},
 {key:'20:50:00', value: 820},
 {key:'21:00:00', value: 820},
 {key:'21:10:00', value: 821},
 {key:'21:20:00', value: 820},
 {key:'21:30:00', value: 819},
 {key:'21:40:00', value: 820},
 {key:'21:50:00', value: 820},
 {key:'22:00:00', value: 820},
 {key:'22:10:00', value: 820},
 {key:'22:20:00', value: 820},
 {key:'22:30:00', value: 820},
 {key:'22:40:00', value: 820},
 {key:'22:50:00', value: 820},
 {key:'23:00:00', value: 820},
 {key:'23:10:00', value: 821},
 {key:'23:20:00', value: 821},
 {key:'23:30:00', value: 821},
 {key:'23:40:00', value: 820},
 {key:'23:50:00', value: 821}]}
 ,{
		key: '2016/6/20',
		values: [ {key:'0:00:00', value: 821},
 {key:'0:10:00', value: 820},
 {key:'0:20:00', value: 820},
 {key:'0:30:00', value: 821},
 {key:'0:40:00', value: 820},
 {key:'0:50:00', value: 821},
 {key:'1:00:00', value: 820},
 {key:'1:10:00', value: 821},
 {key:'1:20:00', value: 820},
 {key:'1:30:00', value: 821},
 {key:'1:40:00', value: 820},
 {key:'1:50:00', value: 820},
 {key:'2:00:00', value: 819},
 {key:'2:10:00', value: 821},
 {key:'2:20:00', value: 820},
 {key:'2:30:00', value: 820},
 {key:'2:40:00', value: 820},
 {key:'2:50:00', value: 820},
 {key:'3:00:00', value: 820},
 {key:'3:10:00', value: 820},
 {key:'3:20:00', value: 820},
 {key:'3:30:00', value: 820},
 {key:'3:40:00', value: 820},
 {key:'3:50:00', value: 820},
 {key:'4:00:00', value: 820},
 {key:'4:10:00', value: 820},
 {key:'4:20:00', value: 820},
 {key:'4:30:00', value: 821},
 {key:'4:40:00', value: 820},
 {key:'4:50:00', value: 820},
 {key:'5:00:00', value: 821},
 {key:'5:10:00', value: 823},
 {key:'5:20:00', value: 819},
 {key:'5:30:00', value: 802},
 {key:'5:40:00', value: 802},
 {key:'5:50:00', value: 797},
 {key:'6:00:00', value: 795},
 {key:'6:10:00', value: 789},
 {key:'6:20:00', value: 785},
 {key:'6:30:00', value: 772},
 {key:'6:40:00', value: 759},
 {key:'6:50:00', value: 755},
 {key:'7:00:00', value: 758},
 {key:'7:10:00', value: 780},
 {key:'7:20:00', value: 824},
 {key:'7:30:00', value: 854},
 {key:'7:40:00', value: 859},
 {key:'7:50:00', value: 856},
 {key:'8:00:00', value: 835},
 {key:'8:10:00', value: 847},
 {key:'8:20:00', value: 860},
 {key:'8:30:00', value: 874},
 {key:'8:40:00', value: 875},
 {key:'8:50:00', value: 884},
 {key:'9:00:00', value: 862},
 {key:'9:10:00', value: 855},
 {key:'9:20:00', value: 862},
 {key:'9:30:00', value: 868},
 {key:'9:40:00', value: 878},
 {key:'9:50:00', value: 888},
 {key:'10:00:00', value: 899},
 {key:'10:10:00', value: 913},
 {key:'10:20:00', value: 906},
 {key:'10:30:00', value: 908},
 {key:'10:40:00', value: 885},
 {key:'10:50:00', value: 889},
 {key:'11:00:00', value: 890},
 {key:'11:10:00', value: 868},
 {key:'11:20:00', value: 839},
 {key:'11:30:00', value: 810},
 {key:'11:40:00', value: 800},
 {key:'11:50:00', value: 820},
 {key:'12:00:00', value: 852},
 {key:'12:10:00', value: 875},
 {key:'12:20:00', value: 883},
 {key:'12:30:00', value: 901},
 {key:'12:40:00', value: 904},
 {key:'12:50:00', value: 889},
 {key:'13:00:00', value: 907},
 {key:'13:10:00', value: 897},
 {key:'13:20:00', value: 904},
 {key:'13:30:00', value: 895},
 {key:'13:40:00', value: 889},
 {key:'13:50:00', value: 874},
 {key:'14:00:00', value: 875},
 {key:'14:10:00', value: 887},
 {key:'14:20:00', value: 881},
 {key:'14:30:00', value: 883},
 {key:'14:40:00', value: 878},
 {key:'14:50:00', value: 873},
 {key:'15:00:00', value: 880},
 {key:'15:10:00', value: 890},
 {key:'15:20:00', value: 899},
 {key:'15:30:00', value: 896},
 {key:'15:40:00', value: 889},
 {key:'15:50:00', value: 881},
 {key:'16:00:00', value: 885},
 {key:'16:10:00', value: 885},
 {key:'16:20:00', value: 876},
 {key:'16:30:00', value: 860},
 {key:'16:40:00', value: 846},
 {key:'16:50:00', value: 820},
 {key:'17:00:00', value: 783},
 {key:'17:10:00', value: 776},
 {key:'17:20:00', value: 751},
 {key:'17:30:00', value: 743},
 {key:'17:40:00', value: 746},
 {key:'17:50:00', value: 747},
 {key:'18:00:00', value: 741},
 {key:'18:10:00', value: 736},
 {key:'18:20:00', value: 730},
 {key:'18:30:00', value: 727},
 {key:'18:40:00', value: 734},
 {key:'18:50:00', value: 732},
 {key:'19:00:00', value: 744},
 {key:'19:10:00', value: 761},
 {key:'19:20:00', value: 775},
 {key:'19:30:00', value: 786},
 {key:'19:40:00', value: 800},
 {key:'19:50:00', value: 775},
 {key:'20:00:00', value: 793},
 {key:'20:10:00', value: 790},
 {key:'20:20:00', value: 796},
 {key:'20:30:00', value: 800},
 {key:'20:40:00', value: 803},
 {key:'20:50:00', value: 806},
 {key:'21:00:00', value: 845},
 {key:'21:10:00', value: 885},
 {key:'21:20:00', value: 893},
 {key:'21:30:00', value: 893},
 {key:'21:40:00', value: 904},
 {key:'21:50:00', value: 895},
 {key:'22:00:00', value: 874},
 {key:'22:10:00', value: 863},
 {key:'22:20:00', value: 856},
 {key:'22:30:00', value: 844},
 {key:'22:40:00', value: 830},
 {key:'22:50:00', value: 823},
 {key:'23:00:00', value: 807},
 {key:'23:10:00', value: 807},
 {key:'23:20:00', value: 800},
 {key:'23:30:00', value: 806},
 {key:'23:40:00', value: 818},
 {key:'23:50:00', value: 826}]}
 ,{
		key: '2016/6/21',
		values: [ {key:'0:00:00', value: 852},
 {key:'0:10:00', value: 870},
 {key:'0:20:00', value: 877},
 {key:'0:30:00', value: 886},
 {key:'0:40:00', value: 888},
 {key:'0:50:00', value: 880},
 {key:'1:00:00', value: 874},
 {key:'1:10:00', value: 878},
 {key:'1:20:00', value: 872},
 {key:'1:30:00', value: 868},
 {key:'1:40:00', value: 858},
 {key:'1:50:00', value: 846},
 {key:'2:00:00', value: 844},
 {key:'2:10:00', value: 831},
 {key:'2:20:00', value: 831},
 {key:'2:30:00', value: 827},
 {key:'2:40:00', value: 817},
 {key:'2:50:00', value: 820},
 {key:'3:00:00', value: 813},
 {key:'3:10:00', value: 808},
 {key:'3:20:00', value: 804},
 {key:'3:30:00', value: 798},
 {key:'3:40:00', value: 805},
 {key:'3:50:00', value: 805},
 {key:'4:00:00', value: 805},
 {key:'4:10:00', value: 801},
 {key:'4:20:00', value: 804},
 {key:'4:30:00', value: 806},
 {key:'4:40:00', value: 811},
 {key:'4:50:00', value: 826},
 {key:'5:00:00', value: 832},
 {key:'5:10:00', value: 840},
 {key:'5:20:00', value: 850},
 {key:'5:30:00', value: 851},
 {key:'5:40:00', value: 849},
 {key:'5:50:00', value: 836},
 {key:'6:00:00', value: 828},
 {key:'6:10:00', value: 831},
 {key:'6:20:00', value: 823},
 {key:'6:30:00', value: 816},
 {key:'6:40:00', value: 806},
 {key:'6:50:00', value: 805},
 {key:'7:00:00', value: 806},
 {key:'7:10:00', value: 820},
 {key:'7:20:00', value: 844},
 {key:'7:30:00', value: 868},
 {key:'7:40:00', value: 866},
 {key:'7:50:00', value: 867},
 {key:'8:00:00', value: 841},
 {key:'8:10:00', value: 863},
 {key:'8:20:00', value: 876},
 {key:'8:30:00', value: 883},
 {key:'8:40:00', value: 881},
 {key:'8:50:00', value: 876},
 {key:'9:00:00', value: 877},
 {key:'9:10:00', value: 893},
 {key:'9:20:00', value: 900},
 {key:'9:30:00', value: 906},
 {key:'9:40:00', value: 909},
 {key:'9:50:00', value: 916},
 {key:'10:00:00', value: 926},
 {key:'10:10:00', value: 921},
 {key:'10:20:00', value: 919},
 {key:'10:30:00', value: 912},
 {key:'10:40:00', value: 898},
 {key:'10:50:00', value: 868},
 {key:'11:00:00', value: 838},
 {key:'11:10:00', value: 861},
 {key:'11:20:00', value: 846},
 {key:'11:30:00', value: 817},
 {key:'11:40:00', value: 817},
 {key:'11:50:00', value: 829},
 {key:'12:00:00', value: 861},
 {key:'12:10:00', value: 884},
 {key:'12:20:00', value: 891},
 {key:'12:30:00', value: 904},
 {key:'12:40:00', value: 907},
 {key:'12:50:00', value: 908},
 {key:'13:00:00', value: 914},
 {key:'13:10:00', value: 914},
 {key:'13:20:00', value: 913},
 {key:'13:30:00', value: 913},
 {key:'13:40:00', value: 909},
 {key:'13:50:00', value: 902},
 {key:'14:00:00', value: 901},
 {key:'14:10:00', value: 911},
 {key:'14:20:00', value: 917},
 {key:'14:30:00', value: 914},
 {key:'14:40:00', value: 913},
 {key:'14:50:00', value: 908},
 {key:'15:00:00', value: 904},
 {key:'15:10:00', value: 911},
 {key:'15:20:00', value: 909},
 {key:'15:30:00', value: 905},
 {key:'15:40:00', value: 906},
 {key:'15:50:00', value: 906},
 {key:'16:00:00', value: 907},
 {key:'16:10:00', value: 908},
 {key:'16:20:00', value: 896},
 {key:'16:30:00', value: 883},
 {key:'16:40:00', value: 870},
 {key:'16:50:00', value: 865},
 {key:'17:00:00', value: 833},
 {key:'17:10:00', value: 829},
 {key:'17:20:00', value: 822},
 {key:'17:30:00', value: 810},
 {key:'17:40:00', value: 803},
 {key:'17:50:00', value: 797},
 {key:'18:00:00', value: 788},
 {key:'18:10:00', value: 788},
 {key:'18:20:00', value: 786},
 {key:'18:30:00', value: 791},
 {key:'18:40:00', value: 790},
 {key:'18:50:00', value: 792},
 {key:'19:00:00', value: 805},
 {key:'19:10:00', value: 824},
 {key:'19:20:00', value: 829},
 {key:'19:30:00', value: 831},
 {key:'19:40:00', value: 827},
 {key:'19:50:00', value: 820},
 {key:'20:00:00', value: 823},
 {key:'20:10:00', value: 817},
 {key:'20:20:00', value: 816},
 {key:'20:30:00', value: 812},
 {key:'20:40:00', value: 803},
 {key:'20:50:00', value: 796},
 {key:'21:00:00', value: 824},
 {key:'21:10:00', value: 847},
 {key:'21:20:00', value: 846},
 {key:'21:30:00', value: 831},
 {key:'21:40:00', value: 829},
 {key:'21:50:00', value: 828},
 {key:'22:00:00', value: 821},
 {key:'22:10:00', value: 798},
 {key:'22:20:00', value: 789},
 {key:'22:30:00', value: 773},
 {key:'22:40:00', value: 756},
 {key:'22:50:00', value: 745},
 {key:'23:00:00', value: 737},
 {key:'23:10:00', value: 734},
 {key:'23:20:00', value: 742},
 {key:'23:30:00', value: 740},
 {key:'23:40:00', value: 745},
 {key:'23:50:00', value: 756}]}
 ,{
		key: '2016/6/22',
		values: [ {key:'0:00:00', value: 776},
 {key:'0:10:00', value: 796},
 {key:'0:20:00', value: 816},
 {key:'0:30:00', value: 813},
 {key:'0:40:00', value: 817},
 {key:'0:50:00', value: 813},
 {key:'1:00:00', value: 813},
 {key:'1:10:00', value: 811},
 {key:'1:20:00', value: 797},
 {key:'1:30:00', value: 787},
 {key:'1:40:00', value: 781},
 {key:'1:50:00', value: 780},
 {key:'2:00:00', value: 772},
 {key:'2:10:00', value: 762},
 {key:'2:20:00', value: 764},
 {key:'2:30:00', value: 760},
 {key:'2:40:00', value: 756},
 {key:'2:50:00', value: 754},
 {key:'3:00:00', value: 745},
 {key:'3:10:00', value: 727},
 {key:'3:20:00', value: 725},
 {key:'3:30:00', value: 720},
 {key:'3:40:00', value: 710},
 {key:'3:50:00', value: 702},
 {key:'4:00:00', value: 702},
 {key:'4:10:00', value: 698},
 {key:'4:20:00', value: 689},
 {key:'4:30:00', value: 695},
 {key:'4:40:00', value: 692},
 {key:'4:50:00', value: 709},
 {key:'5:00:00', value: 709},
 {key:'5:10:00', value: 715},
 {key:'5:20:00', value: 723},
 {key:'5:30:00', value: 729},
 {key:'5:40:00', value: 725},
 {key:'5:50:00', value: 732},
 {key:'6:00:00', value: 729},
 {key:'6:10:00', value: 722},
 {key:'6:20:00', value: 714},
 {key:'6:30:00', value: 705},
 {key:'6:40:00', value: 704},
 {key:'6:50:00', value: 699},
 {key:'7:00:00', value: 709},
 {key:'7:10:00', value: 715},
 {key:'7:20:00', value: 726},
 {key:'7:30:00', value: 748},
 {key:'7:40:00', value: 759},
 {key:'7:50:00', value: 764},
 {key:'8:00:00', value: 738},
 {key:'8:10:00', value: 743},
 {key:'8:20:00', value: 756},
 {key:'8:30:00', value: 779},
 {key:'8:40:00', value: 788},
 {key:'8:50:00', value: 789},
 {key:'9:00:00', value: 801},
 {key:'9:10:00', value: 802},
 {key:'9:20:00', value: 794},
 {key:'9:30:00', value: 804},
 {key:'9:40:00', value: 812},
 {key:'9:50:00', value: 817},
 {key:'10:00:00', value: 825},
 {key:'10:10:00', value: 838},
 {key:'10:20:00', value: 849},
 {key:'10:30:00', value: 847},
 {key:'10:40:00', value: 841},
 {key:'10:50:00', value: 807},
 {key:'11:00:00', value: 783},
 {key:'11:10:00', value: 774},
 {key:'11:20:00', value: 766},
 {key:'11:30:00', value: 740},
 {key:'11:40:00', value: 749},
 {key:'11:50:00', value: 760},
 {key:'12:00:00', value: 792},
 {key:'12:10:00', value: 820},
 {key:'12:20:00', value: 831},
 {key:'12:30:00', value: 855},
 {key:'12:40:00', value: 860},
 {key:'12:50:00', value: 865},
 {key:'13:00:00', value: 881},
 {key:'13:10:00', value: 879},
 {key:'13:20:00', value: 877},
 {key:'13:30:00', value: 858},
 {key:'13:40:00', value: 859},
 {key:'13:50:00', value: 843},
 {key:'14:00:00', value: 850},
 {key:'14:10:00', value: 852},
 {key:'14:20:00', value: 851},
 {key:'14:30:00', value: 849},
 {key:'14:40:00', value: 851},
 {key:'14:50:00', value: 859},
 {key:'15:00:00', value: 866},
 {key:'15:10:00', value: 872},
 {key:'15:20:00', value: 886},
 {key:'15:30:00', value: 883},
 {key:'15:40:00', value: 887},
 {key:'15:50:00', value: 882},
 {key:'16:00:00', value: 870},
 {key:'16:10:00', value: 850},
 {key:'16:20:00', value: 819},
 {key:'16:30:00', value: 820},
 {key:'16:40:00', value: 820},
 {key:'16:50:00', value: 820},
 {key:'17:00:00', value: 820},
 {key:'17:10:00', value: 820},
 {key:'17:20:00', value: 820},
 {key:'17:30:00', value: 820},
 {key:'17:40:00', value: 820},
 {key:'17:50:00', value: 820},
 {key:'18:00:00', value: 820},
 {key:'18:10:00', value: 820},
 {key:'18:20:00', value: 811},
 {key:'18:30:00', value: 820},
 {key:'18:40:00', value: 819},
 {key:'18:50:00', value: 819},
 {key:'19:00:00', value: 825},
 {key:'19:10:00', value: 828},
 {key:'19:20:00', value: 858},
 {key:'19:30:00', value: 871},
 {key:'19:40:00', value: 874},
 {key:'19:50:00', value: 881},
 {key:'20:00:00', value: 884},
 {key:'20:10:00', value: 887},
 {key:'20:20:00', value: 892},
 {key:'20:30:00', value: 899},
 {key:'20:40:00', value: 897},
 {key:'20:50:00', value: 902},
 {key:'21:00:00', value: 933},
 {key:'21:10:00', value: 955},
 {key:'21:20:00', value: 972},
 {key:'21:30:00', value: 974},
 {key:'21:40:00', value: 979},
 {key:'21:50:00', value: 980},
 {key:'22:00:00', value: 931},
 {key:'22:10:00', value: 910},
 {key:'22:20:00', value: 892},
 {key:'22:30:00', value: 871},
 {key:'22:40:00', value: 861},
 {key:'22:50:00', value: 849},
 {key:'23:00:00', value: 842},
 {key:'23:10:00', value: 833},
 {key:'23:20:00', value: 826},
 {key:'23:30:00', value: 832},
 {key:'23:40:00', value: 837},
 {key:'23:50:00', value: 847}]}
 ,{
		key: '2016/6/23',
		values: [ {key:'0:00:00', value: 862},
 {key:'0:10:00', value: 880},
 {key:'0:20:00', value: 887},
 {key:'0:30:00', value: 879},
 {key:'0:40:00', value: 875},
 {key:'0:50:00', value: 851},
 {key:'1:00:00', value: 838},
 {key:'1:10:00', value: 836},
 {key:'1:20:00', value: 819},
 {key:'1:30:00', value: 802},
 {key:'1:40:00', value: 795},
 {key:'1:50:00', value: 792},
 {key:'2:00:00', value: 789},
 {key:'2:10:00', value: 781},
 {key:'2:20:00', value: 777},
 {key:'2:30:00', value: 763},
 {key:'2:40:00', value: 761},
 {key:'2:50:00', value: 757},
 {key:'3:00:00', value: 751},
 {key:'3:10:00', value: 743},
 {key:'3:20:00', value: 747},
 {key:'3:30:00', value: 743},
 {key:'3:40:00', value: 741},
 {key:'3:50:00', value: 738},
 {key:'4:00:00', value: 737},
 {key:'4:10:00', value: 738},
 {key:'4:20:00', value: 736},
 {key:'4:30:00', value: 736},
 {key:'4:40:00', value: 736},
 {key:'4:50:00', value: 746},
 {key:'5:00:00', value: 755},
 {key:'5:10:00', value: 763},
 {key:'5:20:00', value: 772},
 {key:'5:30:00', value: 770},
 {key:'5:40:00', value: 767},
 {key:'5:50:00', value: 759},
 {key:'6:00:00', value: 755},
 {key:'6:10:00', value: 752},
 {key:'6:20:00', value: 741},
 {key:'6:30:00', value: 727},
 {key:'6:40:00', value: 716},
 {key:'6:50:00', value: 713},
 {key:'7:00:00', value: 718},
 {key:'7:10:00', value: 732},
 {key:'7:20:00', value: 750},
 {key:'7:30:00', value: 761},
 {key:'7:40:00', value: 761},
 {key:'7:50:00', value: 767},
 {key:'8:00:00', value: 760},
 {key:'8:10:00', value: 778},
 {key:'8:20:00', value: 782},
 {key:'8:30:00', value: 783},
 {key:'8:40:00', value: 785},
 {key:'8:50:00', value: 782},
 {key:'9:00:00', value: 780},
 {key:'9:10:00', value: 780},
 {key:'9:20:00', value: 780},
 {key:'9:30:00', value: 780},
 {key:'9:40:00', value: 779},
 {key:'9:50:00', value: 780},
 {key:'10:00:00', value: 780},
 {key:'10:10:00', value: 780},
 {key:'10:20:00', value: 780},
 {key:'10:30:00', value: 779},
 {key:'10:40:00', value: 780},
 {key:'10:50:00', value: 780},
 {key:'11:00:00', value: 780},
 {key:'11:10:00', value: 780},
 {key:'11:20:00', value: 780},
 {key:'11:30:00', value: 780},
 {key:'11:40:00', value: 780},
 {key:'11:50:00', value: 780},
 {key:'12:00:00', value: 780},
 {key:'12:10:00', value: 780},
 {key:'12:20:00', value: 780},
 {key:'12:30:00', value: 780},
 {key:'12:40:00', value: 780},
 {key:'12:50:00', value: 780},
 {key:'13:00:00', value: 791},
 {key:'13:10:00', value: 828},
 {key:'13:20:00', value: 866},
 {key:'13:30:00', value: 918},
 {key:'13:40:00', value: 921},
 {key:'13:50:00', value: 921},
 {key:'14:00:00', value: 920},
 {key:'14:10:00', value: 920},
 {key:'14:20:00', value: 920},
 {key:'14:30:00', value: 920},
 {key:'14:40:00', value: 920},
 {key:'14:50:00', value: 920},
 {key:'15:00:00', value: 920},
 {key:'15:10:00', value: 920},
 {key:'15:20:00', value: 920},
 {key:'15:30:00', value: 920},
 {key:'15:40:00', value: 920},
 {key:'15:50:00', value: 917},
 {key:'16:00:00', value: 918},
 {key:'16:10:00', value: 919},
 {key:'16:20:00', value: 919},
 {key:'16:30:00', value: 919},
 {key:'16:40:00', value: 919},
 {key:'16:50:00', value: 912},
 {key:'17:00:00', value: 909},
 {key:'17:10:00', value: 917},
 {key:'17:20:00', value: 912},
 {key:'17:30:00', value: 911},
 {key:'17:40:00', value: 914},
 {key:'17:50:00', value: 910},
 {key:'18:00:00', value: 912},
 {key:'18:10:00', value: 915},
 {key:'18:20:00', value: 912},
 {key:'18:30:00', value: 909},
 {key:'18:40:00', value: 917},
 {key:'18:50:00', value: 910},
 {key:'19:00:00', value: 915},
 {key:'19:10:00', value: 918},
 {key:'19:20:00', value: 915},
 {key:'19:30:00', value: 915},
 {key:'19:40:00', value: 915},
 {key:'19:50:00', value: 916},
 {key:'20:00:00', value: 915},
 {key:'20:10:00', value: 915},
 {key:'20:20:00', value: 914},
 {key:'20:30:00', value: 914},
 {key:'20:40:00', value: 916},
 {key:'20:50:00', value: 911},
 {key:'21:00:00', value: 919},
 {key:'21:10:00', value: 916},
 {key:'21:20:00', value: 918},
 {key:'21:30:00', value: 918},
 {key:'21:40:00', value: 918},
 {key:'21:50:00', value: 916},
 {key:'22:00:00', value: 882},
 {key:'22:10:00', value: 864},
 {key:'22:20:00', value: 900},
 {key:'22:30:00', value: 907},
 {key:'22:40:00', value: 905},
 {key:'22:50:00', value: 898},
 {key:'23:00:00', value: 891},
 {key:'23:10:00', value: 885},
 {key:'23:20:00', value: 889},
 {key:'23:30:00', value: 887},
 {key:'23:40:00', value: 899},
 {key:'23:50:00', value: 898}]}
 ,{
		key: '2016/6/24',
		values: [ {key:'0:00:00', value: 911},
 {key:'0:10:00', value: 908},
 {key:'0:20:00', value: 912},
 {key:'0:30:00', value: 908},
 {key:'0:40:00', value: 908},
 {key:'0:50:00', value: 903},
 {key:'1:00:00', value: 902},
 {key:'1:10:00', value: 896},
 {key:'1:20:00', value: 892},
 {key:'1:30:00', value: 889},
 {key:'1:40:00', value: 882},
 {key:'1:50:00', value: 880},
 {key:'2:00:00', value: 874},
 {key:'2:10:00', value: 877},
 {key:'2:20:00', value: 875},
 {key:'2:30:00', value: 872},
 {key:'2:40:00', value: 872},
 {key:'2:50:00', value: 862},
 {key:'3:00:00', value: 861},
 {key:'3:10:00', value: 857},
 {key:'3:20:00', value: 855},
 {key:'3:30:00', value: 850},
 {key:'3:40:00', value: 856},
 {key:'3:50:00', value: 852},
 {key:'4:00:00', value: 850},
 {key:'4:10:00', value: 855},
 {key:'4:20:00', value: 851},
 {key:'4:30:00', value: 850},
 {key:'4:40:00', value: 850},
 {key:'4:50:00', value: 854},
 {key:'5:00:00', value: 861},
 {key:'5:10:00', value: 871},
 {key:'5:20:00', value: 871},
 {key:'5:30:00', value: 870},
 {key:'5:40:00', value: 869},
 {key:'5:50:00', value: 867},
 {key:'6:00:00', value: 867},
 {key:'6:10:00', value: 863},
 {key:'6:20:00', value: 858},
 {key:'6:30:00', value: 855},
 {key:'6:40:00', value: 855},
 {key:'6:50:00', value: 855},
 {key:'7:00:00', value: 867},
 {key:'7:10:00', value: 874},
 {key:'7:20:00', value: 876},
 {key:'7:30:00', value: 890},
 {key:'7:40:00', value: 884},
 {key:'7:50:00', value: 887},
 {key:'8:00:00', value: 873},
 {key:'8:10:00', value: 880},
 {key:'8:20:00', value: 886},
 {key:'8:30:00', value: 887},
 {key:'8:40:00', value: 885},
 {key:'8:50:00', value: 879},
 {key:'9:00:00', value: 867},
 {key:'9:10:00', value: 776},
 {key:'9:20:00', value: 770},
 {key:'9:30:00', value: 770},
 {key:'9:40:00', value: 777},
 {key:'9:50:00', value: 778},
 {key:'10:00:00', value: 782},
 {key:'10:10:00', value: 785},
 {key:'10:20:00', value: 781},
 {key:'10:30:00', value: 783},
 {key:'10:40:00', value: 784},
 {key:'10:50:00', value: 771},
 {key:'11:00:00', value: 770},
 {key:'11:10:00', value: 768},
 {key:'11:20:00', value: 762},
 {key:'11:30:00', value: 751},
 {key:'11:40:00', value: 753},
 {key:'11:50:00', value: 758},
 {key:'12:00:00', value: 769},
 {key:'12:10:00', value: 767},
 {key:'12:20:00', value: 772},
 {key:'12:30:00', value: 777},
 {key:'12:40:00', value: 776},
 {key:'12:50:00', value: 778},
 {key:'13:00:00', value: 785},
 {key:'13:10:00', value: 780},
 {key:'13:20:00', value: 783},
 {key:'13:30:00', value: 780},
 {key:'13:40:00', value: 777},
 {key:'13:50:00', value: 773},
 {key:'14:00:00', value: 772},
 {key:'14:10:00', value: 769},
 {key:'14:20:00', value: 768},
 {key:'14:30:00', value: 772},
 {key:'14:40:00', value: 768},
 {key:'14:50:00', value: 767},
 {key:'15:00:00', value: 768},
 {key:'15:10:00', value: 769},
 {key:'15:20:00', value: 768},
 {key:'15:30:00', value: 759},
 {key:'15:40:00', value: 768},
 {key:'15:50:00', value: 766},
 {key:'16:00:00', value: 772},
 {key:'16:10:00', value: 772},
 {key:'16:20:00', value: 770},
 {key:'16:30:00', value: 771},
 {key:'16:40:00', value: 764},
 {key:'16:50:00', value: 756},
 {key:'17:00:00', value: 743},
 {key:'17:10:00', value: 740},
 {key:'17:20:00', value: 740},
 {key:'17:30:00', value: 737},
 {key:'17:40:00', value: 741},
 {key:'17:50:00', value: 740},
 {key:'18:00:00', value: 730},
 {key:'18:10:00', value: 733},
 {key:'18:20:00', value: 734},
 {key:'18:30:00', value: 731},
 {key:'18:40:00', value: 735},
 {key:'18:50:00', value: 731},
 {key:'19:00:00', value: 740},
 {key:'19:10:00', value: 742},
 {key:'19:20:00', value: 740},
 {key:'19:30:00', value: 739},
 {key:'19:40:00', value: 738},
 {key:'19:50:00', value: 739},
 {key:'20:00:00', value: 736},
 {key:'20:10:00', value: 730},
 {key:'20:20:00', value: 736},
 {key:'20:30:00', value: 736},
 {key:'20:40:00', value: 734},
 {key:'20:50:00', value: 739},
 {key:'21:00:00', value: 753},
 {key:'21:10:00', value: 756},
 {key:'21:20:00', value: 760},
 {key:'21:30:00', value: 760},
 {key:'21:40:00', value: 753},
 {key:'21:50:00', value: 721},
 {key:'22:00:00', value: 728},
 {key:'22:10:00', value: 729},
 {key:'22:20:00', value: 729},
 {key:'22:30:00', value: 729},
 {key:'22:40:00', value: 729},
 {key:'22:50:00', value: 729},
 {key:'23:00:00', value: 729},
 {key:'23:10:00', value: 729},
 {key:'23:20:00', value: 729},
 {key:'23:30:00', value: 730},
 {key:'23:40:00', value: 729},
 {key:'23:50:00', value: 732}]}
 ,{
		key: '2016/6/25',
		values: [ {key:'0:00:00', value: 747},
 {key:'0:10:00', value: 762},
 {key:'0:20:00', value: 765},
 {key:'0:30:00', value: 765},
 {key:'0:40:00', value: 764},
 {key:'0:50:00', value: 764},
 {key:'1:00:00', value: 765},
 {key:'1:10:00', value: 764},
 {key:'1:20:00', value: 767},
 {key:'1:30:00', value: 767},
 {key:'1:40:00', value: 766},
 {key:'1:50:00', value: 770},
 {key:'2:00:00', value: 764},
 {key:'2:10:00', value: 763},
 {key:'2:20:00', value: 764},
 {key:'2:30:00', value: 763},
 {key:'2:40:00', value: 757},
 {key:'2:50:00', value: 752},
 {key:'3:00:00', value: 750},
 {key:'3:10:00', value: 748},
 {key:'3:20:00', value: 743},
 {key:'3:30:00', value: 751},
 {key:'3:40:00', value: 743},
 {key:'3:50:00', value: 744},
 {key:'4:00:00', value: 740},
 {key:'4:10:00', value: 749},
 {key:'4:20:00', value: 744},
 {key:'4:30:00', value: 743},
 {key:'4:40:00', value: 745},
 {key:'4:50:00', value: 749},
 {key:'5:00:00', value: 755},
 {key:'5:10:00', value: 754},
 {key:'5:20:00', value: 759},
 {key:'5:30:00', value: 759},
 {key:'5:40:00', value: 756},
 {key:'5:50:00', value: 761},
 {key:'6:00:00', value: 767},
 {key:'6:10:00', value: 755},
 {key:'6:20:00', value: 759},
 {key:'6:30:00', value: 757},
 {key:'6:40:00', value: 749},
 {key:'6:50:00', value: 760},
 {key:'7:00:00', value: 787},
 {key:'7:10:00', value: 760},
 {key:'7:20:00', value: 744},
 {key:'7:30:00', value: 744},
 {key:'7:40:00', value: 733},
 {key:'7:50:00', value: 705},
 {key:'8:00:00', value: 653},
 {key:'8:10:00', value: 652},
 {key:'8:20:00', value: 666},
 {key:'8:30:00', value: 684},
 {key:'8:40:00', value: 694},
 {key:'8:50:00', value: 692},
 {key:'9:00:00', value: 696},
 {key:'9:10:00', value: 702},
 {key:'9:20:00', value: 716},
 {key:'9:30:00', value: 726},
 {key:'9:40:00', value: 737},
 {key:'9:50:00', value: 750},
 {key:'10:00:00', value: 761},
 {key:'10:10:00', value: 768},
 {key:'10:20:00', value: 773},
 {key:'10:30:00', value: 764},
 {key:'10:40:00', value: 762},
 {key:'10:50:00', value: 753},
 {key:'11:00:00', value: 750},
 {key:'11:10:00', value: 748},
 {key:'11:20:00', value: 725},
 {key:'11:30:00', value: 708},
 {key:'11:40:00', value: 712},
 {key:'11:50:00', value: 710},
 {key:'12:00:00', value: 727},
 {key:'12:10:00', value: 742},
 {key:'12:20:00', value: 748},
 {key:'12:30:00', value: 761},
 {key:'12:40:00', value: 767},
 {key:'12:50:00', value: 767},
 {key:'13:00:00', value: 775},
 {key:'13:10:00', value: 772},
 {key:'13:20:00', value: 782},
 {key:'13:30:00', value: 778},
 {key:'13:40:00', value: 769},
 {key:'13:50:00', value: 757},
 {key:'14:00:00', value: 745},
 {key:'14:10:00', value: 736},
 {key:'14:20:00', value: 725},
 {key:'14:30:00', value: 713},
 {key:'14:40:00', value: 710},
 {key:'14:50:00', value: 708},
 {key:'15:00:00', value: 709},
 {key:'15:10:00', value: 716},
 {key:'15:20:00', value: 731},
 {key:'15:30:00', value: 736},
 {key:'15:40:00', value: 734},
 {key:'15:50:00', value: 740},
 {key:'16:00:00', value: 750},
 {key:'16:10:00', value: 755},
 {key:'16:20:00', value: 762},
 {key:'16:30:00', value: 755},
 {key:'16:40:00', value: 750},
 {key:'16:50:00', value: 720},
 {key:'17:00:00', value: 672},
 {key:'17:10:00', value: 663},
 {key:'17:20:00', value: 653},
 {key:'17:30:00', value: 639},
 {key:'17:40:00', value: 624},
 {key:'17:50:00', value: 621},
 {key:'18:00:00', value: 609},
 {key:'18:10:00', value: 599},
 {key:'18:20:00', value: 599},
 {key:'18:30:00', value: 602},
 {key:'18:40:00', value: 602},
 {key:'18:50:00', value: 600},
 {key:'19:00:00', value: 600},
 {key:'19:10:00', value: 610},
 {key:'19:20:00', value: 633},
 {key:'19:30:00', value: 636},
 {key:'19:40:00', value: 652},
 {key:'19:50:00', value: 652},
 {key:'20:00:00', value: 669},
 {key:'20:10:00', value: 683},
 {key:'20:20:00', value: 690},
 {key:'20:30:00', value: 700},
 {key:'20:40:00', value: 688},
 {key:'20:50:00', value: 691},
 {key:'21:00:00', value: 729},
 {key:'21:10:00', value: 753},
 {key:'21:20:00', value: 777},
 {key:'21:30:00', value: 761},
 {key:'21:40:00', value: 775},
 {key:'21:50:00', value: 790},
 {key:'22:00:00', value: 787},
 {key:'22:10:00', value: 766},
 {key:'22:20:00', value: 760},
 {key:'22:30:00', value: 742},
 {key:'22:40:00', value: 725},
 {key:'22:50:00', value: 712},
 {key:'23:00:00', value: 695},
 {key:'23:10:00', value: 679},
 {key:'23:20:00', value: 669},
 {key:'23:30:00', value: 665},
 {key:'23:40:00', value: 668},
 {key:'23:50:00', value: 670}]}
 ,{
		key: '2016/6/26',
		values: [ {key:'0:00:00', value: 709},
 {key:'0:10:00', value: 754},
 {key:'0:20:00', value: 767},
 {key:'0:30:00', value: 775},
 {key:'0:40:00', value: 783},
 {key:'0:50:00', value: 769},
 {key:'1:00:00', value: 776},
 {key:'1:10:00', value: 769},
 {key:'1:20:00', value: 765},
 {key:'1:30:00', value: 760},
 {key:'1:40:00', value: 760},
 {key:'1:50:00', value: 753},
 {key:'2:00:00', value: 744},
 {key:'2:10:00', value: 733},
 {key:'2:20:00', value: 726},
 {key:'2:30:00', value: 723},
 {key:'2:40:00', value: 719},
 {key:'2:50:00', value: 701},
 {key:'3:00:00', value: 690},
 {key:'3:10:00', value: 689},
 {key:'3:20:00', value: 691},
 {key:'3:30:00', value: 690},
 {key:'3:40:00', value: 690},
 {key:'3:50:00', value: 691},
 {key:'4:00:00', value: 690},
 {key:'4:10:00', value: 690},
 {key:'4:20:00', value: 695},
 {key:'4:30:00', value: 706},
 {key:'4:40:00', value: 704},
 {key:'4:50:00', value: 717},
 {key:'5:00:00', value: 732},
 {key:'5:10:00', value: 762},
 {key:'5:20:00', value: 765},
 {key:'5:30:00', value: 769},
 {key:'5:40:00', value: 774},
 {key:'5:50:00', value: 772},
 {key:'6:00:00', value: 762},
 {key:'6:10:00', value: 755},
 {key:'6:20:00', value: 745},
 {key:'6:30:00', value: 739},
 {key:'6:40:00', value: 733},
 {key:'6:50:00', value: 725},
 {key:'7:00:00', value: 717},
 {key:'7:10:00', value: 721},
 {key:'7:20:00', value: 727},
 {key:'7:30:00', value: 718},
 {key:'7:40:00', value: 698},
 {key:'7:50:00', value: 664},
 {key:'8:00:00', value: 644},
 {key:'8:10:00', value: 628},
 {key:'8:20:00', value: 612},
 {key:'8:30:00', value: 602},
 {key:'8:40:00', value: 602},
 {key:'8:50:00', value: 600},
 {key:'9:00:00', value: 603},
 {key:'9:10:00', value: 611},
 {key:'9:20:00', value: 625},
 {key:'9:30:00', value: 643},
 {key:'9:40:00', value: 662},
 {key:'9:50:00', value: 684},
 {key:'10:00:00', value: 702},
 {key:'10:10:00', value: 681},
 {key:'10:20:00', value: 671},
 {key:'10:30:00', value: 669},
 {key:'10:40:00', value: 666},
 {key:'10:50:00', value: 648},
 {key:'11:00:00', value: 634},
 {key:'11:10:00', value: 640},
 {key:'11:20:00', value: 629},
 {key:'11:30:00', value: 616},
 {key:'11:40:00', value: 609},
 {key:'11:50:00', value: 614},
 {key:'12:00:00', value: 638},
 {key:'12:10:00', value: 653},
 {key:'12:20:00', value: 659},
 {key:'12:30:00', value: 665},
 {key:'12:40:00', value: 672},
 {key:'12:50:00', value: 675},
 {key:'13:00:00', value: 688},
 {key:'13:10:00', value: 696},
 {key:'13:20:00', value: 725},
 {key:'13:30:00', value: 741},
 {key:'13:40:00', value: 741},
 {key:'13:50:00', value: 728},
 {key:'14:00:00', value: 721},
 {key:'14:10:00', value: 718},
 {key:'14:20:00', value: 705},
 {key:'14:30:00', value: 720},
 {key:'14:40:00', value: 721},
 {key:'14:50:00', value: 721},
 {key:'15:00:00', value: 721},
 {key:'15:10:00', value: 724},
 {key:'15:20:00', value: 730},
 {key:'15:30:00', value: 733},
 {key:'15:40:00', value: 733},
 {key:'15:50:00', value: 735},
 {key:'16:00:00', value: 740},
 {key:'16:10:00', value: 748},
 {key:'16:20:00', value: 762},
 {key:'16:30:00', value: 762},
 {key:'16:40:00', value: 757},
 {key:'16:50:00', value: 750},
 {key:'17:00:00', value: 724},
 {key:'17:10:00', value: 696},
 {key:'17:20:00', value: 679},
 {key:'17:30:00', value: 662},
 {key:'17:40:00', value: 664},
 {key:'17:50:00', value: 653},
 {key:'18:00:00', value: 641},
 {key:'18:10:00', value: 639},
 {key:'18:20:00', value: 639},
 {key:'18:30:00', value: 638},
 {key:'18:40:00', value: 634},
 {key:'18:50:00', value: 624},
 {key:'19:00:00', value: 638},
 {key:'19:10:00', value: 663},
 {key:'19:20:00', value: 683},
 {key:'19:30:00', value: 707},
 {key:'19:40:00', value: 720},
 {key:'19:50:00', value: 717},
 {key:'20:00:00', value: 718},
 {key:'20:10:00', value: 721},
 {key:'20:20:00', value: 729},
 {key:'20:30:00', value: 732},
 {key:'20:40:00', value: 733},
 {key:'20:50:00', value: 740},
 {key:'21:00:00', value: 778},
 {key:'21:10:00', value: 816},
 {key:'21:20:00', value: 809},
 {key:'21:30:00', value: 790},
 {key:'21:40:00', value: 800},
 {key:'21:50:00', value: 815},
 {key:'22:00:00', value: 811},
 {key:'22:10:00', value: 787},
 {key:'22:20:00', value: 785},
 {key:'22:30:00', value: 754},
 {key:'22:40:00', value: 744},
 {key:'22:50:00', value: 714},
 {key:'23:00:00', value: 683},
 {key:'23:10:00', value: 659},
 {key:'23:20:00', value: 637},
 {key:'23:30:00', value: 642},
 {key:'23:40:00', value: 664},
 {key:'23:50:00', value: 679}]}
 ,{
		key: '2016/6/27',
		values: [ {key:'0:00:00', value: 713},
 {key:'0:10:00', value: 751},
 {key:'0:20:00', value: 759},
 {key:'0:30:00', value: 771},
 {key:'0:40:00', value: 780},
 {key:'0:50:00', value: 769},
 {key:'1:00:00', value: 775},
 {key:'1:10:00', value: 776},
 {key:'1:20:00', value: 765},
 {key:'1:30:00', value: 765},
 {key:'1:40:00', value: 755},
 {key:'1:50:00', value: 751},
 {key:'2:00:00', value: 741},
 {key:'2:10:00', value: 741},
 {key:'2:20:00', value: 745},
 {key:'2:30:00', value: 736},
 {key:'2:40:00', value: 736},
 {key:'2:50:00', value: 741},
 {key:'3:00:00', value: 730},
 {key:'3:10:00', value: 725},
 {key:'3:20:00', value: 721},
 {key:'3:30:00', value: 715},
 {key:'3:40:00', value: 714},
 {key:'3:50:00', value: 712},
 {key:'4:00:00', value: 724},
 {key:'4:10:00', value: 724},
 {key:'4:20:00', value: 718},
 {key:'4:30:00', value: 717},
 {key:'4:40:00', value: 725},
 {key:'4:50:00', value: 733},
 {key:'5:00:00', value: 747},
 {key:'5:10:00', value: 765},
 {key:'5:20:00', value: 788},
 {key:'5:30:00', value: 800},
 {key:'5:40:00', value: 804},
 {key:'5:50:00', value: 813},
 {key:'6:00:00', value: 824},
 {key:'6:10:00', value: 843},
 {key:'6:20:00', value: 851},
 {key:'6:30:00', value: 851},
 {key:'6:40:00', value: 854},
 {key:'6:50:00', value: 842},
 {key:'7:00:00', value: 870},
 {key:'7:10:00', value: 886},
 {key:'7:20:00', value: 892},
 {key:'7:30:00', value: 903},
 {key:'7:40:00', value: 901},
 {key:'7:50:00', value: 889},
 {key:'8:00:00', value: 825},
 {key:'8:10:00', value: 810},
 {key:'8:20:00', value: 808},
 {key:'8:30:00', value: 818},
 {key:'8:40:00', value: 802},
 {key:'8:50:00', value: 805},
 {key:'9:00:00', value: 804},
 {key:'9:10:00', value: 797},
 {key:'9:20:00', value: 796},
 {key:'9:30:00', value: 805},
 {key:'9:40:00', value: 814},
 {key:'9:50:00', value: 826},
 {key:'10:00:00', value: 826},
 {key:'10:10:00', value: 825},
 {key:'10:20:00', value: 832},
 {key:'10:30:00', value: 821},
 {key:'10:40:00', value: 820},
 {key:'10:50:00', value: 794},
 {key:'11:00:00', value: 769},
 {key:'11:10:00', value: 768},
 {key:'11:20:00', value: 737},
 {key:'11:30:00', value: 692},
 {key:'11:40:00', value: 685},
 {key:'11:50:00', value: 700},
 {key:'12:00:00', value: 722},
 {key:'12:10:00', value: 734},
 {key:'12:20:00', value: 734},
 {key:'12:30:00', value: 742},
 {key:'12:40:00', value: 753},
 {key:'12:50:00', value: 751},
 {key:'13:00:00', value: 763},
 {key:'13:10:00', value: 762},
 {key:'13:20:00', value: 760},
 {key:'13:30:00', value: 753},
 {key:'13:40:00', value: 746},
 {key:'13:50:00', value: 732},
 {key:'14:00:00', value: 746},
 {key:'14:10:00', value: 786},
 {key:'14:20:00', value: 814},
 {key:'14:30:00', value: 820},
 {key:'14:40:00', value: 817},
 {key:'14:50:00', value: 821},
 {key:'15:00:00', value: 825},
 {key:'15:10:00', value: 825},
 {key:'15:20:00', value: 829},
 {key:'15:30:00', value: 815},
 {key:'15:40:00', value: 823},
 {key:'15:50:00', value: 814},
 {key:'16:00:00', value: 818},
 {key:'16:10:00', value: 826},
 {key:'16:20:00', value: 826},
 {key:'16:30:00', value: 826},
 {key:'16:40:00', value: 829},
 {key:'16:50:00', value: 816},
 {key:'17:00:00', value: 797},
 {key:'17:10:00', value: 765},
 {key:'17:20:00', value: 717},
 {key:'17:30:00', value: 683},
 {key:'17:40:00', value: 666},
 {key:'17:50:00', value: 656},
 {key:'18:00:00', value: 649},
 {key:'18:10:00', value: 627},
 {key:'18:20:00', value: 620},
 {key:'18:30:00', value: 609},
 {key:'18:40:00', value: 605},
 {key:'18:50:00', value: 602},
 {key:'19:00:00', value: 626},
 {key:'19:10:00', value: 644},
 {key:'19:20:00', value: 656},
 {key:'19:30:00', value: 661},
 {key:'19:40:00', value: 666},
 {key:'19:50:00', value: 657},
 {key:'20:00:00', value: 655},
 {key:'20:10:00', value: 656},
 {key:'20:20:00', value: 664},
 {key:'20:30:00', value: 665},
 {key:'20:40:00', value: 667},
 {key:'20:50:00', value: 666},
 {key:'21:00:00', value: 698},
 {key:'21:10:00', value: 734},
 {key:'21:20:00', value: 755},
 {key:'21:30:00', value: 760},
 {key:'21:40:00', value: 776},
 {key:'21:50:00', value: 783},
 {key:'22:00:00', value: 780},
 {key:'22:10:00', value: 785},
 {key:'22:20:00', value: 773},
 {key:'22:30:00', value: 759},
 {key:'22:40:00', value: 749},
 {key:'22:50:00', value: 742},
 {key:'23:00:00', value: 732},
 {key:'23:10:00', value: 733},
 {key:'23:20:00', value: 729},
 {key:'23:30:00', value: 739},
 {key:'23:40:00', value: 748},
 {key:'23:50:00', value: 764}]}
 ,{
		key: '2016/6/28',
		values: [ {key:'0:00:00', value: 799},
 {key:'0:10:00', value: 794},
 {key:'0:20:00', value: 795},
 {key:'0:30:00', value: 799},
 {key:'0:40:00', value: 799},
 {key:'0:50:00', value: 792},
 {key:'1:00:00', value: 791},
 {key:'1:10:00', value: 774},
 {key:'1:20:00', value: 773},
 {key:'1:30:00', value: 765},
 {key:'1:40:00', value: 764},
 {key:'1:50:00', value: 761},
 {key:'2:00:00', value: 759},
 {key:'2:10:00', value: 751},
 {key:'2:20:00', value: 745},
 {key:'2:30:00', value: 740},
 {key:'2:40:00', value: 735},
 {key:'2:50:00', value: 736},
 {key:'3:00:00', value: 745},
 {key:'3:10:00', value: 741},
 {key:'3:20:00', value: 730},
 {key:'3:30:00', value: 726},
 {key:'3:40:00', value: 723},
 {key:'3:50:00', value: 722},
 {key:'4:00:00', value: 724},
 {key:'4:10:00', value: 717},
 {key:'4:20:00', value: 723},
 {key:'4:30:00', value: 728},
 {key:'4:40:00', value: 730},
 {key:'4:50:00', value: 728},
 {key:'5:00:00', value: 746},
 {key:'5:10:00', value: 759},
 {key:'5:20:00', value: 775},
 {key:'5:30:00', value: 798},
 {key:'5:40:00', value: 800},
 {key:'5:50:00', value: 799},
 {key:'6:00:00', value: 800},
 {key:'6:10:00', value: 797},
 {key:'6:20:00', value: 805},
 {key:'6:30:00', value: 800},
 {key:'6:40:00', value: 791},
 {key:'6:50:00', value: 802},
 {key:'7:00:00', value: 817},
 {key:'7:10:00', value: 830},
 {key:'7:20:00', value: 849},
 {key:'7:30:00', value: 873},
 {key:'7:40:00', value: 868},
 {key:'7:50:00', value: 827},
 {key:'8:00:00', value: 763},
 {key:'8:10:00', value: 765},
 {key:'8:20:00', value: 775},
 {key:'8:30:00', value: 795},
 {key:'8:40:00', value: 795},
 {key:'8:50:00', value: 776},
 {key:'9:00:00', value: 773},
 {key:'9:10:00', value: 774},
 {key:'9:20:00', value: 783},
 {key:'9:30:00', value: 788},
 {key:'9:40:00', value: 799},
 {key:'9:50:00', value: 808},
 {key:'10:00:00', value: 816},
 {key:'10:10:00', value: 834},
 {key:'10:20:00', value: 835},
 {key:'10:30:00', value: 828},
 {key:'10:40:00', value: 816},
 {key:'10:50:00', value: 794},
 {key:'11:00:00', value: 765},
 {key:'11:10:00', value: 777},
 {key:'11:20:00', value: 747},
 {key:'11:30:00', value: 705},
 {key:'11:40:00', value: 715},
 {key:'11:50:00', value: 727},
 {key:'12:00:00', value: 758},
 {key:'12:10:00', value: 784},
 {key:'12:20:00', value: 794},
 {key:'12:30:00', value: 827},
 {key:'12:40:00', value: 870},
 {key:'12:50:00', value: 876},
 {key:'13:00:00', value: 895},
 {key:'13:10:00', value: 893},
 {key:'13:20:00', value: 886},
 {key:'13:30:00', value: 888},
 {key:'13:40:00', value: 887},
 {key:'13:50:00', value: 876},
 {key:'14:00:00', value: 878},
 {key:'14:10:00', value: 876},
 {key:'14:20:00', value: 875},
 {key:'14:30:00', value: 878},
 {key:'14:40:00', value: 872},
 {key:'14:50:00', value: 874},
 {key:'15:00:00', value: 878},
 {key:'15:10:00', value: 858},
 {key:'15:20:00', value: 837},
 {key:'15:30:00', value: 839},
 {key:'15:40:00', value: 839},
 {key:'15:50:00', value: 838},
 {key:'16:00:00', value: 851},
 {key:'16:10:00', value: 860},
 {key:'16:20:00', value: 860},
 {key:'16:30:00', value: 854},
 {key:'16:40:00', value: 848},
 {key:'16:50:00', value: 841},
 {key:'17:00:00', value: 809},
 {key:'17:10:00', value: 794},
 {key:'17:20:00', value: 771},
 {key:'17:30:00', value: 753},
 {key:'17:40:00', value: 740},
 {key:'17:50:00', value: 723},
 {key:'18:00:00', value: 712},
 {key:'18:10:00', value: 719},
 {key:'18:20:00', value: 713},
 {key:'18:30:00', value: 720},
 {key:'18:40:00', value: 726},
 {key:'18:50:00', value: 734},
 {key:'19:00:00', value: 740},
 {key:'19:10:00', value: 747},
 {key:'19:20:00', value: 756},
 {key:'19:30:00', value: 767},
 {key:'19:40:00', value: 769},
 {key:'19:50:00', value: 764},
 {key:'20:00:00', value: 759},
 {key:'20:10:00', value: 755},
 {key:'20:20:00', value: 762},
 {key:'20:30:00', value: 755},
 {key:'20:40:00', value: 752},
 {key:'20:50:00', value: 762},
 {key:'21:00:00', value: 809},
 {key:'21:10:00', value: 839},
 {key:'21:20:00', value: 836},
 {key:'21:30:00', value: 829},
 {key:'21:40:00', value: 825},
 {key:'21:50:00', value: 837},
 {key:'22:00:00', value: 828},
 {key:'22:10:00', value: 798},
 {key:'22:20:00', value: 789},
 {key:'22:30:00', value: 772},
 {key:'22:40:00', value: 751},
 {key:'22:50:00', value: 769},
 {key:'23:00:00', value: 819},
 {key:'23:10:00', value: 834},
 {key:'23:20:00', value: 841},
 {key:'23:30:00', value: 846},
 {key:'23:40:00', value: 852},
 {key:'23:50:00', value: 856}]}
 ,{
		key: '2016/6/29',
		values: [ {key:'0:00:00', value: 871},
 {key:'0:10:00', value: 885},
 {key:'0:20:00', value: 892},
 {key:'0:30:00', value: 890},
 {key:'0:40:00', value: 883},
 {key:'0:50:00', value: 839},
 {key:'1:00:00', value: 814},
 {key:'1:10:00', value: 810},
 {key:'1:20:00', value: 801},
 {key:'1:30:00', value: 791},
 {key:'1:40:00', value: 791},
 {key:'1:50:00', value: 780},
 {key:'2:00:00', value: 779},
 {key:'2:10:00', value: 767},
 {key:'2:20:00', value: 760},
 {key:'2:30:00', value: 756},
 {key:'2:40:00', value: 758},
 {key:'2:50:00', value: 747},
 {key:'3:00:00', value: 751},
 {key:'3:10:00', value: 745},
 {key:'3:20:00', value: 745},
 {key:'3:30:00', value: 744},
 {key:'3:40:00', value: 743},
 {key:'3:50:00', value: 743},
 {key:'4:00:00', value: 743},
 {key:'4:10:00', value: 744},
 {key:'4:20:00', value: 747},
 {key:'4:30:00', value: 750},
 {key:'4:40:00', value: 757},
 {key:'4:50:00', value: 762},
 {key:'5:00:00', value: 772},
 {key:'5:10:00', value: 797},
 {key:'5:20:00', value: 813},
 {key:'5:30:00', value: 821},
 {key:'5:40:00', value: 833},
 {key:'5:50:00', value: 811},
 {key:'6:00:00', value: 798},
 {key:'6:10:00', value: 798},
 {key:'6:20:00', value: 793},
 {key:'6:30:00', value: 782},
 {key:'6:40:00', value: 773},
 {key:'6:50:00', value: 777},
 {key:'7:00:00', value: 793},
 {key:'7:10:00', value: 803},
 {key:'7:20:00', value: 817},
 {key:'7:30:00', value: 838},
 {key:'7:40:00', value: 818},
 {key:'7:50:00', value: 783},
 {key:'8:00:00', value: 730},
 {key:'8:10:00', value: 747},
 {key:'8:20:00', value: 751},
 {key:'8:30:00', value: 760},
 {key:'8:40:00', value: 754},
 {key:'8:50:00', value: 758},
 {key:'9:00:00', value: 758},
 {key:'9:10:00', value: 775},
 {key:'9:20:00', value: 788},
 {key:'9:30:00', value: 800},
 {key:'9:40:00', value: 803},
 {key:'9:50:00', value: 812},
 {key:'10:00:00', value: 825},
 {key:'10:10:00', value: 838},
 {key:'10:20:00', value: 857},
 {key:'10:30:00', value: 863},
 {key:'10:40:00', value: 852},
 {key:'10:50:00', value: 838},
 {key:'11:00:00', value: 804},
 {key:'11:10:00', value: 805},
 {key:'11:20:00', value: 787},
 {key:'11:30:00', value: 757},
 {key:'11:40:00', value: 749},
 {key:'11:50:00', value: 759},
 {key:'12:00:00', value: 789},
 {key:'12:10:00', value: 811},
 {key:'12:20:00', value: 813},
 {key:'12:30:00', value: 832},
 {key:'12:40:00', value: 834},
 {key:'12:50:00', value: 836},
 {key:'13:00:00', value: 854},
 {key:'13:10:00', value: 857},
 {key:'13:20:00', value: 867},
 {key:'13:30:00', value: 861},
 {key:'13:40:00', value: 849},
 {key:'13:50:00', value: 850},
 {key:'14:00:00', value: 849},
 {key:'14:10:00', value: 860},
 {key:'14:20:00', value: 861},
 {key:'14:30:00', value: 856},
 {key:'14:40:00', value: 853},
 {key:'14:50:00', value: 854},
 {key:'15:00:00', value: 860},
 {key:'15:10:00', value: 865},
 {key:'15:20:00', value: 878},
 {key:'15:30:00', value: 877},
 {key:'15:40:00', value: 882},
 {key:'15:50:00', value: 883},
 {key:'16:00:00', value: 897},
 {key:'16:10:00', value: 914},
 {key:'16:20:00', value: 914},
 {key:'16:30:00', value: 914},
 {key:'16:40:00', value: 915},
 {key:'16:50:00', value: 899},
 {key:'17:00:00', value: 867},
 {key:'17:10:00', value: 851},
 {key:'17:20:00', value: 834},
 {key:'17:30:00', value: 827},
 {key:'17:40:00', value: 821},
 {key:'17:50:00', value: 822},
 {key:'18:00:00', value: 810},
 {key:'18:10:00', value: 811},
 {key:'18:20:00', value: 808},
 {key:'18:30:00', value: 802},
 {key:'18:40:00', value: 792},
 {key:'18:50:00', value: 788},
 {key:'19:00:00', value: 794},
 {key:'19:10:00', value: 805},
 {key:'19:20:00', value: 824},
 {key:'19:30:00', value: 834},
 {key:'19:40:00', value: 834},
 {key:'19:50:00', value: 836},
 {key:'20:00:00', value: 834},
 {key:'20:10:00', value: 825},
 {key:'20:20:00', value: 838},
 {key:'20:30:00', value: 829},
 {key:'20:40:00', value: 835},
 {key:'20:50:00', value: 838},
 {key:'21:00:00', value: 867},
 {key:'21:10:00', value: 896},
 {key:'21:20:00', value: 889},
 {key:'21:30:00', value: 886},
 {key:'21:40:00', value: 877},
 {key:'21:50:00', value: 872},
 {key:'22:00:00', value: 862},
 {key:'22:10:00', value: 850},
 {key:'22:20:00', value: 840},
 {key:'22:30:00', value: 827},
 {key:'22:40:00', value: 813},
 {key:'22:50:00', value: 785},
 {key:'23:00:00', value: 769},
 {key:'23:10:00', value: 752},
 {key:'23:20:00', value: 751},
 {key:'23:30:00', value: 747},
 {key:'23:40:00', value: 752},
 {key:'23:50:00', value: 764}]}
 ,{
		key: '2016/6/30',
		values: [ {key:'0:00:00', value: 796},
 {key:'0:10:00', value: 828},
 {key:'0:20:00', value: 823},
 {key:'0:30:00', value: 819},
 {key:'0:40:00', value: 818},
 {key:'0:50:00', value: 814},
 {key:'1:00:00', value: 805},
 {key:'1:10:00', value: 793},
 {key:'1:20:00', value: 788},
 {key:'1:30:00', value: 782},
 {key:'1:40:00', value: 772},
 {key:'1:50:00', value: 770},
 {key:'2:00:00', value: 770},
 {key:'2:10:00', value: 768},
 {key:'2:20:00', value: 751},
 {key:'2:30:00', value: 735},
 {key:'2:40:00', value: 727},
 {key:'2:50:00', value: 722},
 {key:'3:00:00', value: 725},
 {key:'3:10:00', value: 715},
 {key:'3:20:00', value: 707},
 {key:'3:30:00', value: 705},
 {key:'3:40:00', value: 705},
 {key:'3:50:00', value: 702},
 {key:'4:00:00', value: 708},
 {key:'4:10:00', value: 711},
 {key:'4:20:00', value: 707},
 {key:'4:30:00', value: 715},
 {key:'4:40:00', value: 717},
 {key:'4:50:00', value: 734},
 {key:'5:00:00', value: 749},
 {key:'5:10:00', value: 769},
 {key:'5:20:00', value: 778},
 {key:'5:30:00', value: 793},
 {key:'5:40:00', value: 810},
 {key:'5:50:00', value: 815},
 {key:'6:00:00', value: 804},
 {key:'6:10:00', value: 809},
 {key:'6:20:00', value: 796},
 {key:'6:30:00', value: 794},
 {key:'6:40:00', value: 772},
 {key:'6:50:00', value: 771},
 {key:'7:00:00', value: 784},
 {key:'7:10:00', value: 789},
 {key:'7:20:00', value: 797},
 {key:'7:30:00', value: 822},
 {key:'7:40:00', value: 826},
 {key:'7:50:00', value: 784},
 {key:'8:00:00', value: 747},
 {key:'8:10:00', value: 747},
 {key:'8:20:00', value: 779},
 {key:'8:30:00', value: 809},
 {key:'8:40:00', value: 823},
 {key:'8:50:00', value: 826},
 {key:'9:00:00', value: 828},
 {key:'9:10:00', value: 835},
 {key:'9:20:00', value: 843},
 {key:'9:30:00', value: 860},
 {key:'9:40:00', value: 900},
 {key:'9:50:00', value: 922},
 {key:'10:00:00', value: 937},
 {key:'10:10:00', value: 947},
 {key:'10:20:00', value: 963},
 {key:'10:30:00', value: 965},
 {key:'10:40:00', value: 970},
 {key:'10:50:00', value: 965},
 {key:'11:00:00', value: 941},
 {key:'11:10:00', value: 940},
 {key:'11:20:00', value: 925},
 {key:'11:30:00', value: 906},
 {key:'11:40:00', value: 911},
 {key:'11:50:00', value: 922},
 {key:'12:00:00', value: 941},
 {key:'12:10:00', value: 964},
 {key:'12:20:00', value: 974},
 {key:'12:30:00', value: 978},
 {key:'12:40:00', value: 979},
 {key:'12:50:00', value: 971},
 {key:'13:00:00', value: 985},
 {key:'13:10:00', value: 972},
 {key:'13:20:00', value: 970},
 {key:'13:30:00', value: 965},
 {key:'13:40:00', value: 948},
 {key:'13:50:00', value: 952},
 {key:'14:00:00', value: 948},
 {key:'14:10:00', value: 950},
 {key:'14:20:00', value: 951},
 {key:'14:30:00', value: 948},
 {key:'14:40:00', value: 943},
 {key:'14:50:00', value: 927},
 {key:'15:00:00', value: 911},
 {key:'15:10:00', value: 906},
 {key:'15:20:00', value: 914},
 {key:'15:30:00', value: 898},
 {key:'15:40:00', value: 903},
 {key:'15:50:00', value: 896},
 {key:'16:00:00', value: 911},
 {key:'16:10:00', value: 936},
 {key:'16:20:00', value: 944},
 {key:'16:30:00', value: 937},
 {key:'16:40:00', value: 925},
 {key:'16:50:00', value: 922},
 {key:'17:00:00', value: 893},
 {key:'17:10:00', value: 901},
 {key:'17:20:00', value: 891},
 {key:'17:30:00', value: 878},
 {key:'17:40:00', value: 882},
 {key:'17:50:00', value: 884},
 {key:'18:00:00', value: 882},
 {key:'18:10:00', value: 878},
 {key:'18:20:00', value: 878},
 {key:'18:30:00', value: 879},
 {key:'18:40:00', value: 872},
 {key:'18:50:00', value: 876},
 {key:'19:00:00', value: 882},
 {key:'19:10:00', value: 897},
 {key:'19:20:00', value: 910},
 {key:'19:30:00', value: 918},
 {key:'19:40:00', value: 922},
 {key:'19:50:00', value: 933},
 {key:'20:00:00', value: 935},
 {key:'20:10:00', value: 939},
 {key:'20:20:00', value: 943},
 {key:'20:30:00', value: 947},
 {key:'20:40:00', value: 955},
 {key:'20:50:00', value: 953},
 {key:'21:00:00', value: 977},
 {key:'21:10:00', value: 972},
 {key:'21:20:00', value: 958},
 {key:'21:30:00', value: 905},
 {key:'21:40:00', value: 898},
 {key:'21:50:00', value: 948},
 {key:'22:00:00', value: 964},
 {key:'22:10:00', value: 968},
 {key:'22:20:00', value: 969},
 {key:'22:30:00', value: 964},
 {key:'22:40:00', value: 921},
 {key:'22:50:00', value: 883},
 {key:'23:00:00', value: 867},
 {key:'23:10:00', value: 862},
 {key:'23:20:00', value: 842},
 {key:'23:30:00', value: 837},
 {key:'23:40:00', value: 833},
 {key:'23:50:00', value: 828}]
 }];

	return data;
}
/**
 * Random Dataset - Surface Plot 2
 *
 * @returns {Array}
 */
function dataset5() {
	//var cx = 0.8;
	//var cy = 0.3;
    //var yset,setz,setx;

	var f = function f(vx, vz) {
        var yset;
        d3.csv('e610.csv')
       .then(function(csvdata){	
            yset=Math.round(csvdata[vx+vz*10].MW); 
        //    console.log(yset);
            //document.write(yset);
		});
        yset=1;
        //document.write(yset);
        //yset=Math.random()-0.1;
        return yset;
	};

	var xRange = d3.range(0, 24, 1);
	var zRange = d3.range(0, 30, 1);
	var nx = xRange.length;
	var nz = zRange.length;

	var data = d3.range(nx).map(function (i) {

		var values = d3.range(nz).map(function (j) {
			return {
				key: j,
				value: f(xRange[i], zRange[j])
			};
		});

		return {
			key: i,
			values: values
		};
	});

	return data;
}
      
                        
var randomData = Object.freeze({

	randomNum: randomNum,
	dataset4: dataset4,
	dataset5: dataset5,
});

/**
 * d3-x3dom
 *
 * @author James Saunders [james@saunders-family.net]
 * @copyright Copyright (C) 2019 James Saunders
 * @license GPLv2
 */

var author$1 = "James Saunders";
var year = new Date().getFullYear();
var copyright = "Copyright (C) " + year + " " + author$1;

var index = {
	version: version,
	author: author$1,
	copyright: copyright,
	license: license,
	chart: chart,
	component: component,
	dataTransform: dataTransform,
	randomData: randomData,
	events: events
};

return index;

})));
