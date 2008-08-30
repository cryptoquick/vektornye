# !/usr/bin/env python
# Bulk of this document is based on code from here: http://code.google.com/appengine/articles/rpc.html

import os

from django.utils import simplejson
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util

from google.appengine.ext import db

import zlib

class MainPage(webapp.RequestHandler):
	""" Renders the main template."""
	def get(self):
		template_values = { }
		self.response.headers['Content-Type'] = "image/svg+xml"
		path = os.path.join(os.path.dirname(__file__), "index.svg")
		self.response.out.write(template.render(path, template_values))


class RPCHandler(webapp.RequestHandler):
	""" Allows the functions defined in the RPCMethods class to be RPCed."""
	def __init__(self):
		webapp.RequestHandler.__init__(self)
		self.methods = RPCMethods()
	
	def post(self):
		args = simplejson.loads(self.request.body)
		func = args[0]
		data = args[1:]
		args = self.request.headers['content-length']
		
		field = simplejson.dumps(data[2])
		
		dbdata = DBField(
			owner 		= data[0],
			name 		= data[1],
			field 		= field,
			revision 	= data[3],
			blockcount 	= data[4]
		)
		
		dbdata.put()
		
		if func[0] == '_':
			self.error(403) # access denied
			return
		
		func = getattr(self.methods, func, None)
		if not func:
			self.error(404) # file not found
			return
		
		result = func(*args)
		self.response.out.write(simplejson.dumps(result))


class RPCMethods:
	""" Defines the methods that can be RPCed.
	NOTE: Do not allow remote callers access to private/protected "_*" methods.
	"""
		
	def Save(self, *args):
		#
		#return len(args[0])
		return ''.join(args) + ' bytes of data saved to server.'


class DBField(db.Model):
	owner		= db.StringProperty(required=True)# db.UserProperty()
	name		= db.StringProperty(required=True)
	field		= db.StringProperty(required=True)
	datetime	= db.DateTimeProperty(required=True, auto_now_add=True)
	revision	= db.FloatProperty(required=True)
	blockcount	= db.IntegerProperty(required=True)


def main():
	app = webapp.WSGIApplication([
		('/', MainPage),
		('/rpc', RPCHandler),
		], debug=True)
	util.run_wsgi_app(app)

if __name__ == '__main__':
	main()