from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
import json
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import *
from django.db.models import Max
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
        max_version = ProjectDetails.objects.filter(proj_name=id).aggregate(Max('version'))['version__max']

        # Filter ProjectDetails with the given project id and highest version
        projDetails = ProjectDetails.objects.filter(proj_name=id, version=max_version)
        versions = ProjectDetails.objects.values("version").distinct().order_by("-version")

        total_amount_sum = 0

        for detail in projDetails:
            detail.total_price = detail.price * detail.quantity
            total_amount_sum += detail.total_price

    return render(request, "engineering/project.html", {
        "projDetails":projDetails,
        "projectName":projectName,
        "total_amount_sum": total_amount_sum,
        "version": max_version,
        "versions": versions
    })

def newProj(request, title):
    if request.method == "GET":
        projects = Project.objects.all()
        phases = Phase.objects.all()
        if title == 'Submersible Pump':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
                "phases": phases,
            })
        
        elif title == 'Chemical Pump':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
                "phases": phases,
            })
        elif title == 'Roots Blower':
            return render(request, "engineering/new_proj.html", {
                "title": title,
                "projects": projects,
                "phases": phases,
            })
    
    elif request.method == "POST" and title == "Submersible Pump":
        user = request.user
        projectName = request.POST["projectSelect"]
        system = request.POST["system"]
        power = request.POST["power"]
        flowRate = request.POST["flowRateHidden"]
        totalHead = request.POST["totalHeadHidden"]
        efficiency = request.POST["efficiencyHidden"]
        phaseInput = request.POST["phase"]
        quantity = request.POST["quantity"]
        price = request.POST["price"]
        
        project = Project.objects.get(proj_name=projectName)
        phase = Phase.objects.get(phase=phaseInput)
        
        newPump = Pump(
        user=user,
        project=project,
        system=system,
        power=power,
        flowrate=flowRate,  
        height=totalHead,   
        efficiency=efficiency,
        ph=phase,           
        quantity=quantity,
        price=price,
    )

        newPump.save()
        projects = Project.objects.all()
        
        return render(request, "engineering/index.html", {
            "projects": projects,
        })

@csrf_exempt
def save_data(request, id):
    if request.method == 'POST':
        try:
            json_data = json.loads(request.body)
            project_name = Project.objects.get(id=id)
            
            # Find the maximum version for the given project
            max_version = ProjectDetails.objects.filter(proj_name=project_name).aggregate(Max('version'))['version__max']

            for item in json_data:
                # Increment the version for each new detail
                version = max_version + 1 if max_version is not None else 1

                project_detail = ProjectDetails(
                    version=version,
                    name = request.user,
                    proj_name=project_name,
                    description=item['description'],
                    quantity=item['quantity'],
                    price=item['price']
                )
                project_detail.save()

            return JsonResponse({'success': True})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


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