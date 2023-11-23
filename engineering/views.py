from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from .models import *
from django.db.models import Sum
# Create your views here.

def index(request):
    if request.method == 'GET':
        projects = Project.objects.all()
        return render(request, "engineering/index.html", {
            "projects": projects,

        })
    
    elif request.method == "POST":
        title = request.POST["proj_title"]
        new_project = Project(proj_name=title)
        new_project.save()
        return HttpResponseRedirect(reverse('project', args=[new_project.id]))
    
    
def project(request, id):
    if request.method == "GET":
        projectName = Project.objects.get(pk=id)
        projDetails = ProjectDetails.objects.filter(proj_name=id)

        total_amount_sum = 0

        for detail in projDetails:
            detail.total_price = detail.price * detail.quantity
            total_amount_sum += detail.total_price

    return render(request, "engineering/project.html", {
        "projDetails":projDetails,
        "projectName":projectName,
        "total_amount_sum": total_amount_sum,
    })

def newProj(request, title):
    if request.method == "GET":
        projects = Project.objects.all()
        if title == 'Submersible Pump':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
            })
        
        elif title == 'Chemical Pump':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
            })
        elif title == 'Roots Blower':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
            })
        

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "engineering/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "engineering/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "engineering/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "engineering/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "engineering/register.html")