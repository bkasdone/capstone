from django.contrib import admin
from .models import Pump, Phase, Project, ProjectDetails, Version
# Register your models here.

admin.site.register(Pump)
admin.site.register(Phase)
admin.site.register(Project)
admin.site.register(ProjectDetails)
admin.site.register(Version)
