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

# Create your models here.
class Pump(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    ph = models.ForeignKey(Phase, on_delete=models.CASCADE)
    flowrate = models.DecimalField(max_digits=9, decimal_places=2)
    height = models.DecimalField(max_digits=9, decimal_places=2)
    efficiency = models.DecimalField(max_digits=3, decimal_places=2, validators=[MaxValueValidator(limit_value=1)])
    quantity = models.IntegerField(blank=True, null=True)
    price = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"by {self.user}, Project: {self.project}"
    
    
class ProjectDetails(models.Model):
    proj_name = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project")
    description = models.CharField(max_length=300)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
    
    def __str__(self):
        return f"{self.proj_name}"