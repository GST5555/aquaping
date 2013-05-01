import os
import webapp2
import jinja2
import sys
import re
import inspect
import urllib2
import json
#from django.utils import simplejson as json

from datetime import date
from google.appengine.api import users
from google.appengine.ext import db


template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape=True)

class Handler(webapp2.RequestHandler):
    #writes out html code
    def write(self, *a, **kw):
        #first argument is about the response
        #second argument is about the request
        self.response.out.write(*a, **kw)
    
    #get the template and return the html form
    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)

    #render the html page from a template
    def render(self, template, **kw):
        self.write(self.render_str(template,**kw))

#get the data from an url 
class DataRequester:
    
    def __init__(self):
        self.data_by_month_link = "http://elisa.dyndns-web.com/nasaspace/month.html"
        self.data_by_year_link = "http://elisa.dyndns-web.com/nasaspace/year.html"
        self.data_by_month_raw = None
        self.data_by_year_raw = None
        self.data_by_year = []
        self.data_by_month = []

    def get_data(self):
        #try to get the month data
        try:
            #sys.stderr.write(self.data_by_month_link)
            #sys.stderr.write('\n')
            month_req = urllib2.Request(self.data_by_month_link)
            #sys.stderr.write(self.data_by_month_link)
            #sys.stderr.write('\n')
            #sys.stderr.write(inspect.getmembers(month_req))
            month_response = urllib2.urlopen(month_req)
            #sys.stderr.write(self.data_by_month_link)
            #sys.stderr.write('\n')
            self.data_by_month_raw = month_response.read().split('\n')
        except urllib2.URLError:
            pass
        
        #try to get the year data
        try:
            #sys.stderr.write(self.data_by_year_link)
            year_req = urllib2.Request(self.data_by_year_link)
            #sys.stderr.write(self.data_by_month_link)
            #sys.stderr.write('\n')
            year_response = urllib2.urlopen(year_req)
            self.data_by_year_raw = year_response.read().split('\n')
        except urllib2.URLError:
            pass
        
    def parse_data_by_month(self):
        if self.data_by_month_raw != None:
            #sys.stderr.write(''.join(self.data_by_month_raw))
            #return
            for line in self.data_by_month_raw:
                l = line.strip().split()
                #print l
                data = [x for x in l if x != '']
                #for d in data:
                #    sys.stderr.write(d)
                #    sys.stderr.write(' ')
                #sys.stderr.write('\n')
                #print data
                #return
                if len(data) >= 3:
                    if data[0].isdigit() and data[1].isdigit():
                        #print data
                        d = [data[0], data[1], data[2]]
                        self.data_by_month.append(d)

                        
    def parse_data_by_year(self):
        if self.data_by_year_raw != None:
            #print self.data_by_year_raw
            #return
            for line in self.data_by_year_raw:
                l = line.strip().split()
                #print l
                data = [x for x in l if x != '']
                #print data
                #return
                if len(data) >= 2:
                    if data[0].isdigit():
                        #print data
                        d = [data[0], data[1]]
                        self.data_by_year.append(d)

    def get_data_by_month(self):
        return self.data_by_month

    def get_data_by_year(self):
        return self.data_by_year

def parse_to_json_months(months):
    great_string = '{"record":['
    for i in range(len(months)):
        mstr = 'Dec'
        if months[i][1] == '1':
            mstr = 'Jan'
        elif months[i][1] == '2':
            mstr = 'Feb'
        elif months[i][1] == '3':
            mstr = 'Mar'
        elif months[i][1] == '4':
            mstr = 'Apr'
        elif months[i][1] == '5':
            mstr = 'May'
        elif months[i][1] == '6':
            mstr = 'Jun'
        elif months[i][1] == '7':
            mstr = 'Jul'
        elif months[i][1] == '8':
            mstr = 'Aug'
        elif months[i][1] == '9':
            mstr = 'Sep'
        elif months[i][1] == '10':
            mstr = 'Oct'
        elif months[i][1] == '11':
            mstr = 'Nov'

        m = '{"date": "01-%s-%s", "data": %s}'%(mstr, months[i][0], months[i][2])
        if i < len(months) - 1:
            m += ","
        great_string += m
    great_string += "]}"
    return great_string

def parse_to_json_years(years):
    great_string = '{"record" :['
    for i in range(len(years)):
        m = '{"date": "01-Jan-%s", "data": %s}'%(years[i][0], years[i][1])
        if i < len(years) - 1:
            m += ","
        great_string += m
    great_string += "]}"
    return great_string

class RPCHandler(webapp2.RequestHandler):
    
    def __init__(self,request=None, response=None):
        self.initialize(request, response)
        #webapp2.RequestHandler.__init__(self, request=None, response=None)
        self.data_requester = DataRequester()

    def get(self):
        pass
    
    def post(self):
        text = "year"
        text = self.request.get("text")
        month_data = self.data_requester.get_data_by_month()
        year_data = self.data_requester.get_data_by_year()
        if len(month_data) <=2 or len(year_data) <= 2:
            self.data_requester.get_data()
            self.data_requester.parse_data_by_month()
            self.data_requester.parse_data_by_year()

        if text == "year":
            year_data = self.data_requester.get_data_by_year()
            year_data_str = parse_to_json_years(year_data)
            self.response.out.write(year_data_str)
        else:
            month_data = self.data_requester.get_data_by_month()
            month_data_str = parse_to_json_months(month_data)
            self.response.out.write(month_data_str)
        

class Visualizer(Handler):
    
    def render_front(self, textout="", months="", years=""):
        self.render("/visualization.html", textout=textout, months=months, years=years)
        
    def get(self):
        self.render_front()
                
    def post(self):
        pass
        #textin = self.request.get("text")
        #self.response.out.write('got it')
        #data_requester = DataRequester()
        #data_requester.get_data()
        #data_requester.parse_data_by_month()
        #data_requester.parse_data_by_year()
        #month_data = data_requester.get_data_by_month()
        #year_data = data_requester.get_data_by_year()
        #self.render_front(textin, month_data, year_data)

app = webapp2.WSGIApplication([('/', Visualizer), ('/rpc', RPCHandler)], debug=True)

