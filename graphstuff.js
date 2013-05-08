/*

Things to add to api:

- delete neighbours
- delete vertices (leave spot to point at null and destroy previous object)
- change distance of neighbour
- change label of vertex
- print graph <--> grab entire graph

*/

var http = require('http');
var url = require('url');
var qs = require('querystring');
var express = require('express');

var app = express();

var vertices = [];
var neighbours = [];

/*

Setup the API request protocols using Express.

*/

// Get all the vertices in the graph
app.get('/vertex', function(request,response) {
	response.send(vertices);
});

// make a new vertex with the label
// POST /vertex/new/{labelname} --> returns server id of vertex
app.post('/vertex/new/:label', function(request, response) {
	response.send(createNewVertex(request.params.label));
});

// return a specific vertex dependent on the id
// GET /vertex/{vertexserverid} -- > returns JSON info about vertex if id is within index
app.get('/vertex/:id', function(request,response) {
	var id = request.params.id;
	var vertex = getVertexInfo(id);
	console.log("getting info about vertex with id " + id + " ==> " + JSON.stringify(vertex));
	response.send(vertex);
});

// get all the neighbours
// GET /neighbours --> send JSON representation of all neighbours
app.get('/neighbours', function(request,response) {
	response.send(neighbours);
});

// create neighbours for a specific vertex
// POST /vertex/{serverrtexidfororigin}/neighbours/new/{vertexserveridforend}/{distancebetweennodes}
app.post('/vertex/:id/neighbours/new/:ids/:distances', function(request, response) {
	var id = request.params.id;
	var ids = request.params.ids;
	var distances = request.params.distances;
	console.log("Creating neighbours for vertex " + id + " with neighbours " + ids + " with distances " + distances);
	response.send(addNeighbourForVertex(id, ids, distances));
});

// get enighbours of a certain vertex
// GET /vertex/{vertexserverid}/neighbours --> neighbours in JSON
app.get('/vertex/:id/neighbours', function(request,response) {
	var id = request.params.id;
	var neighboursForVertex = getNeighboursInfo(id);
	console.log("getting neighbours about vertex with id " + id + " ==> " + JSON.stringify(neighboursForVertex));
	response.send(neighboursForVertex);
});

// find the shortest path between two nodes
// GET /shortestpath/{startingservervextedid}/{endingserververtexid}
app.get('/shortestpath/:beginId/:endId', function(request,response) {
	var beginId = request.params.beginId;
	var endId = request.params.endId;
	var shortestpath = findShortestPathbetween(beginId,endId);

	console.log("Finding the fastest path between " + JSON.stringify(getVertexInfo(beginId)) + " and  " + JSON.stringify(getVertexInfo(endId)) + " ==> " + JSON.stringify(shortestpath));
	response.send(shortestpath);
});

// runserver on port 1337
app.listen(1337);

/*

Create functions for the API

*/

// process shortest path request
function findShortestPathbetween(beginId, endId) {
	if (beginId >= vertices.length || beginId < 0)
		return "{ \"error\" : \"Beginning Id invalid\" }";
	
	if (endId >= vertices.length || endId < 0)
		return "{ \"error\" : \"Ending Id invalid\" }";

	return findShortestPathbetween({ "path":[vertices[beginId]], "distance":0 }, vertices[beginId], vertices[endId]);
}

// use algorithm to find shortest path
function findShortestPathbetween(path, current, destination) {
	var bestPath = null;

	if (current == destination)
		return path;
	
	var listOfneighbours = neighbours[vertices.indexOf(current)];	// get a list of neighbours

	for (var i = 0; i < listOfneighbours.length; i++) {
		// choose a neighbour from the list
		var neighbour = listOfneighbours[i];

		// if we have already visited the vertex skip this neighbour else we break the rules of forming a path (will cause inifinite otherwise)
		if (path['path'].indexOf(neighbour['vertex']) > -1) 
			continue;

		// find the shortest path between the neighbour and the destination
		var currentPath = findShortestPathbetween({ "path":path['path'].concat(neighbour['vertex']), "distance":(path['distance'] + neighbour['distance']) }, neighbour['vertex'], destination);

		// if we cant reach the destination by travelling through this neighbour then skip it
		if (currentPath == null)
			continue;

		// else check if this path is better than the path that already exists if it exists
		if (bestPath == null || currentPath['distance'] < bestPath['distance'])
			bestPath = currentPath;	// then update this to being the shortest path
	}

	return bestPath;
}

function createNewVertex(label) {
	vertices.push({"label":label});
	neighbours.push([]);
	return vertices.length-1;
}

function getVertexInfo(id) {
	if (id >= vertices.length || id < 0)
		return { "error" : "Id invalid" };
	else
		return vertices[id];
}

function addNeighbourForVertex(vertexId, neighbourIds, distances) {
	if (vertexId >= vertices.length || vertexId < 0)
		return { "error" : "Id invalid" };
	else if (neighbourIds.length != distances.length)
		return { "error": "Improper length of distances/neighbors" };

	for (index in neighbourIds) {
		var neighbourId = neighbourIds[index];

		if (distances[index] < 0)
			return { "error": "Improper distance for neighbours #" + index };
		neighbours[vertexId].push({"vertex":vertices[neighbourId], "distance":distances[index]});
	}

	return neighbours[vertexId];
}

function getNeighboursInfo(id) {
	if (id >= vertices.length || id < 0)
		return { "error" : "Id invalid" };
	else
		return neighbours[id];
}

function printPath(path) {
	if (path == null)
		console.log("NON EXISTANT");
	else {
		for (var i = 0; i < path['path'].length; i++)
			console.log(path['path'][i]['label'] + " --> ");

		console.log(path['distance'] + "<br>");
	}
}

console.log('Server running at http://127.0.0.1:1337/');