from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator

User = get_user_model()

class Phase(models.Model):
    phase = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.phase}"

class Project(models.Model):
    proj_name = models.CharField(max_length=300)
    
    def __str__(self):
        return f'{self.proj_name}'
    
class Version(models.Model):
    proj_id = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_id")
    version = models.IntegerField()
    editor = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    
    def __str__(self):
        return f'version:{self.version}'
    
    
class ProjectDetails(models.Model):
    ver = models.ForeignKey(Version, on_delete=models.CASCADE, related_name="vers_details")
    description = models.CharField(max_length=300)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
    
    def __str__(self):
        return f"Project:{self.ver.proj_id.proj_name} v.{self.ver.version} edited by:{self.ver.editor}"

class Pump(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    system = models.CharField(max_length=50, blank=True, null=True)
    power = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)
    ph = models.ForeignKey(Phase, on_delete=models.CASCADE)
    flowrate = models.DecimalField(max_digits=9, decimal_places=2)
    height = models.DecimalField(max_digits=9, decimal_places=2)
    efficiency = models.DecimalField(max_digits=3, decimal_places=2, validators=[MaxValueValidator(limit_value=1)])
    quantity = models.IntegerField(blank=True, null=True)
    price = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"by {self.user}, Project: {self.project}"
    
    def serialize(self):
        return {
            "user":self.user.username,
            "project":self.project.proj_name,
            "system":self.system,
            "power": float(self.power),
            "ph":self.ph.phase,
            "quantity":self.quantity,
            "price": float(self.price),
        }
    
