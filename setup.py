from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in costing/__init__.py
from costing import __version__ as version

setup(
	name="costing",
	version=version,
	description="Costing",
	author="Indictrans",
	author_email="jitendra.r@indictranstech.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
