from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator

User = get_user_model()

class Phase(models.Model):
    phase = models.IntegerField()

    def __str__(self):
        return f"{self.phase}PH"

# Create your models here.
class Pump(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.CharField(max_length=100)
    ph = models.ForeignKey(Phase, on_delete=models.CASCADE)
    flowrate = models.DecimalField(max_digits=9, decimal_places=2)
    height = models.DecimalField(max_digits=9, decimal_places=2)
    efficiency = models.DecimalField(max_digits=3, decimal_places=2, validators=[MaxValueValidator(limit_value=1)])
    quantity = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"by {self.user}, Project: {self.project}"