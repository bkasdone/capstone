# Generated by Django 4.2.4 on 2023-11-18 03:23

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Phase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phase', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('proj_name', models.CharField(max_length=300)),
            ],
        ),
        migrations.CreateModel(
            name='Pump',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('flowrate', models.DecimalField(decimal_places=2, max_digits=9)),
                ('height', models.DecimalField(decimal_places=2, max_digits=9)),
                ('efficiency', models.DecimalField(decimal_places=2, max_digits=3, validators=[django.core.validators.MaxValueValidator(limit_value=1)])),
                ('quantity', models.IntegerField(blank=True, null=True)),
                ('ph', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='engineering.phase')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='engineering.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
