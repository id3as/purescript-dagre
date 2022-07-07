"use strict";

import { graphlib, layout } from "dagre";
import { cloneDeep } from "lodash";

export function layoutInternal(show) {
    return function(config) {
        return function(nodes) {
            return function(edges) {
                /**** Setup graph ******/
                var g = new graphlib.Graph();
                g.setGraph({ rankdir: show.rankDirection(config.rankDirection),
                             align: show.align(config.align),
                             nodesep: config.nodeSep,
                             edgesep: config.edgeSep,
                             ranksep: config.rankSep,
                             marginx: config.marginX,
                             marginy: config.marginY,
                             acyclicer: show.acyclicer(config.acyclicer),
                             ranker: show.ranker(config.ranker)
                           });
                g.setDefaultEdgeLabel(function() { return {}; });

                nodes.map(function(nodeTuple) {
                    var nodeId = nodeTuple.value0;
                    var nodeLabel = cloneDeep(nodeTuple.value1);
                    g.setNode(nodeId, nodeLabel);
                });

                edges.map(function(edgeTuple) {
                    var edge = cloneDeep(edgeTuple.value0);
                    var l = edgeTuple.value1;
                    var edgeLabel = { minlen: l.minLength,
                                    weight: l.weight,
                                    width: l.width,
                                    height: l.height,
                                    labelpos: show.labelPosition(l.labelPosition),
                                    labeloffset: l.labelOffset
                                    };
                    g.setEdge(edge.from, edge.to, edgeLabel);
                });


                /**** Run layout ********/
                layout(g);


                /**** Get layout result into expected format ****/
                var nodesRes = g.nodes().map(function(nodeId) {
                    var label = g.node(nodeId);
                    var nodeResult =
                        { nodeId: nodeId,
                        position: { x: label.x,
                                    y: label.y
                                    },
                          width: label.width,
                          height: label.height
                        };
                    return nodeResult;
                });

                var edgesRes = g.edges().map(function(edge) {
                    var label = g.edge(edge.v, edge.w);
                    var edgeResult =
                        { edge: { from: edge.v,
                                to: edge.w
                                },
                        labelCenter: { x: label.x,
                                    y: label.y
                                    },
                        controlPoints: label.points
                        };
                    return edgeResult;
                });

                var result =
                    { graphWidth: g.graph().width,
                      graphHeight: g.graph().height,
                      nodes: nodesRes,
                      edges: edgesRes
                    };


                return result;
            };
        };
    };
}
