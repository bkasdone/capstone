from django.shortcuts import render, redirect, get_object_or_404
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
        projects = Project.objects.all().order_by("proj_name")
        return render(request, "engineering/index.html", {
            "projects": projects,

        })
    
    elif request.method == "POST":
        title = request.POST["proj_title"]
        new_project = Project(proj_name=title)
        new_project.save()
        new_version = Version(proj_id=new_project, version=0, editor=request.user)
        new_version.save()
        return redirect("index")

    
def project(request, id):
    if request.method == "GET":
        projectName = get_object_or_404(Project, pk=id)
        
        # Get the latest version for the given project id
        latest_version = Version.objects.filter(proj_id=id).order_by('-version').first()

        # Filter ProjectDetails with the given project id and highest version
        projDetails = ProjectDetails.objects.filter(ver=latest_version)
        versions = Version.objects.filter(proj_id=id).order_by('-version')
        total_amount_sum = 0

        for detail in projDetails:
            detail.total_price = detail.price * detail.quantity
            total_amount_sum += detail.total_price 
            
        designDetails = Pump.objects.filter(project=id)

        return render(request, "engineering/project.html", {
            "projDetails": projDetails,
            "projectName": projectName,
            "total_amount_sum": total_amount_sum,
            "version": latest_version,
            "versions": versions,
            "designDetails": designDetails,
        })
def newProj(request, title):
    if request.method == "GET":
        projects = Project.objects.all().order_by("proj_name")
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


def save_data(request, id):
    if request.method == 'POST':
        try:
            json_data = json.loads(request.body)
            project = get_object_or_404(Project, id=id)
            latest_version = Version.objects.filter(proj_id=project).order_by('-version').first()
            new_version_number = latest_version.version + 1 if latest_version else 1

            new_version = Version(proj_id=project, version=new_version_number, editor=request.user)
            new_version.save()

            for item in json_data:
                project_detail = ProjectDetails(
                    ver=new_version,
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


def get_data(request, id, version):
    if request.method == "GET":
        # Assuming you have a valid Project object with the given id
        # You may need to adapt this part based on your project structure
        project_version = Version.objects.get(proj_id=id, version=version)
        project_details = ProjectDetails.objects.filter(ver=project_version)

        # Convert project details to a list of dictionaries
        proj_details_list = []
        for detail in project_details:
            proj_details_list.append({
                'description': detail.description,
                'quantity': detail.quantity,
                'price': float(detail.price),
                'totalAmount': float(detail.quantity * float(detail.price)),
            })

        return JsonResponse({'projDetails': proj_details_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def designData(request, projectId, pumpID):
    if request.method == 'GET':
        try:
            pumpDetails = Pump.objects.filter(project=projectId, pk=pumpID)
            return JsonResponse([detail.serialize() for detail in pumpDetails], safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


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