from setuptools import setup, find_packages

setup(
    name="investment-portfolio-app",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "pydantic>=1.8.2",
        "pandas>=1.3.0",
        "numpy>=1.21.0",
        "scipy>=1.7.0",
        "requests>=2.26.0"
    ],
    author="Your Name",
    author_email="your.email@example.com",
    description="Investment Portfolio Management System",
    keywords="investment, portfolio, finance, analytics",
    python_requires=">=3.8",
)