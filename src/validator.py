from oca_ds_validator import OCABundle, OCADataSet
import sys

# Getting the ocabundle path from the command line to validate
oca_bundle = OCABundle(sys.argv[1])

# Getting the dataset path from the command line to validate
oca_dataset = OCADataSet(sys.argv[2])

# validation_result = oca_bundle.validate( oca_dataset)